-- =====================================================================
-- Zé Grana · Schema inicial
-- =====================================================================
-- Contém:
--  - users (identidade: phone + telegram_id), assinatura, plano
--  - categories (padrões + customizadas)
--  - accounts (dinheiro, PIX, débito, crédito — com cartão)
--  - cards (metadados de cartão: fechamento, vencimento, limite)
--  - transactions (lançamentos, com suporte a parcelas)
--  - goals (metas por categoria/período)
--  - bot_sessions (estado multi-turn do chat)
--  - webhook_events (log de webhooks pra idempotência e debug)
-- RLS ativo em todas as tabelas de usuário.
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- =====================================================================
-- enums
-- =====================================================================
do $$ begin
  create type plan_tier as enum ('free', 'monthly', 'annual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('active', 'past_due', 'canceled', 'trialing');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tx_type as enum ('expense', 'income', 'transfer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('cash', 'pix', 'debit', 'credit', 'transfer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type bot_channel as enum ('telegram', 'whatsapp');
exception when duplicate_object then null; end $$;

-- =====================================================================
-- users
-- =====================================================================
create table if not exists public.users (
  id              uuid primary key default uuid_generate_v4(),
  auth_user_id    uuid references auth.users(id) on delete set null,
  phone           text unique,                       -- E.164, ex: +5511999999999
  telegram_id     bigint unique,
  email           text,
  name            text,
  plan            plan_tier not null default 'free',
  status          subscription_status not null default 'trialing',
  kirvano_customer_id  text,
  kirvano_subscription_id text,
  renews_at       timestamptz,
  onboarded_at    timestamptz,
  settings        jsonb not null default '{}'::jsonb, -- timezone, currency, reminder prefs...
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists users_auth_user_id_idx on public.users(auth_user_id);

-- =====================================================================
-- categories
-- =====================================================================
create table if not exists public.categories (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  name         text not null,
  icon         text,
  color        text,
  budget_limit numeric(12,2),      -- limite mensal opcional
  is_default   boolean not null default false,
  created_at   timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists categories_user_idx on public.categories(user_id);

-- =====================================================================
-- accounts (dinheiro, PIX, banco, cartão)
-- =====================================================================
create table if not exists public.accounts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  name         text not null,                  -- "Nubank", "Carteira", "C6 crédito"
  kind         payment_method not null,        -- cash, pix, debit, credit, transfer
  institution  text,                           -- "Nubank", "Itaú"
  is_default   boolean not null default false,
  archived_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists accounts_user_idx on public.accounts(user_id);

-- =====================================================================
-- cards (detalhe de cartão de crédito)
-- =====================================================================
create table if not exists public.cards (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  account_id      uuid not null references public.accounts(id) on delete cascade,
  closing_day     smallint not null check (closing_day between 1 and 31),
  due_day         smallint not null check (due_day between 1 and 31),
  credit_limit    numeric(12,2),
  brand           text,                        -- visa, master, elo, amex...
  last4           text,
  created_at      timestamptz not null default now()
);

create unique index if not exists cards_account_unique on public.cards(account_id);

-- =====================================================================
-- transactions
-- =====================================================================
create table if not exists public.transactions (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.users(id) on delete cascade,
  account_id       uuid references public.accounts(id) on delete set null,
  category_id      uuid references public.categories(id) on delete set null,
  type             tx_type not null,
  amount           numeric(12,2) not null,      -- positivo; type define sinal
  description      text,
  occurred_on      date not null,

  -- Parcelamento: se tx faz parte de uma série de parcelas
  parcel_group_id  uuid,                        -- agrupa N parcelas
  parcel_n         smallint,                    -- 1, 2, 3...
  parcel_total     smallint,                    -- total de parcelas

  -- Auditoria do bot
  channel          bot_channel,
  raw_message      text,                        -- msg original do usuário
  confirmed_at     timestamptz,                 -- só conta se confirmada
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists tx_user_date_idx on public.transactions(user_id, occurred_on desc);
create index if not exists tx_user_category_idx on public.transactions(user_id, category_id);
create index if not exists tx_parcel_group_idx on public.transactions(parcel_group_id);

-- =====================================================================
-- goals
-- =====================================================================
create table if not exists public.goals (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  category_id  uuid references public.categories(id) on delete cascade,
  amount       numeric(12,2) not null,
  period       text not null default 'monthly',  -- monthly | weekly | annual
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists goals_user_idx on public.goals(user_id);

-- =====================================================================
-- bot_sessions (estado multi-turn)
-- =====================================================================
create table if not exists public.bot_sessions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  channel     bot_channel not null,
  state       text not null default 'idle',    -- idle | awaiting_confirmation | onboarding_...
  context     jsonb not null default '{}'::jsonb,
  last_tx_id  uuid references public.transactions(id) on delete set null,
  updated_at  timestamptz not null default now()
);

create unique index if not exists bot_session_unique on public.bot_sessions(user_id, channel);

-- =====================================================================
-- webhook_events (idempotência + audit)
-- =====================================================================
create table if not exists public.webhook_events (
  id          uuid primary key default uuid_generate_v4(),
  source      text not null,                    -- 'telegram' | 'whatsapp' | 'kirvano'
  external_id text not null,                    -- id do evento externo
  payload     jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error       text,
  unique (source, external_id)
);

-- =====================================================================
-- updated_at triggers
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists users_updated on public.users;
create trigger users_updated before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists tx_updated on public.transactions;
create trigger tx_updated before update on public.transactions
  for each row execute function public.set_updated_at();

drop trigger if exists session_updated on public.bot_sessions;
create trigger session_updated before update on public.bot_sessions
  for each row execute function public.set_updated_at();

-- =====================================================================
-- RLS — Row Level Security
-- =====================================================================
alter table public.users          enable row level security;
alter table public.categories     enable row level security;
alter table public.accounts       enable row level security;
alter table public.cards          enable row level security;
alter table public.transactions   enable row level security;
alter table public.goals          enable row level security;
alter table public.bot_sessions   enable row level security;

-- Helper: resolve public.users.id a partir do auth.uid()
create or replace function public.current_user_id()
returns uuid language sql stable as $$
  select id from public.users where auth_user_id = auth.uid() limit 1;
$$;

-- Policies (padrão: usuário só vê seus próprios dados)
create policy "users_self_read" on public.users
  for select using (auth_user_id = auth.uid());
create policy "users_self_update" on public.users
  for update using (auth_user_id = auth.uid());

create policy "categories_owner" on public.categories
  for all using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());

create policy "accounts_owner" on public.accounts
  for all using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());

create policy "cards_owner" on public.cards
  for all using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());

create policy "tx_owner" on public.transactions
  for all using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());

create policy "goals_owner" on public.goals
  for all using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());

create policy "session_owner" on public.bot_sessions
  for all using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());

-- webhook_events: só service_role acessa (sem policy de usuário)
alter table public.webhook_events enable row level security;
create policy "webhook_service_only" on public.webhook_events
  for all using (auth.role() = 'service_role');
