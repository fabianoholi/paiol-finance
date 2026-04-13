# Zé Grana

> Finanças pessoais via WhatsApp + Telegram. Você manda mensagem, o Zé registra.

SaaS brasileiro de controle financeiro pessoal cuja interface principal é um bot conversacional. A web é read-mostly (landing + dashboard de visualização).

---

## Stack

- **Frontend + API**: [Next.js 15](https://nextjs.org) (App Router) + Tailwind v3 + Recharts
- **Banco + Auth**: [Supabase](https://supabase.com) (Postgres + RLS)
- **LLM parser**: [Claude Haiku 4.5](https://www.anthropic.com) com prompt caching
- **Bot Telegram**: Bot API oficial
- **Bot WhatsApp**: [Evolution API](https://github.com/EvolutionAPI/evolution-api) self-hosted (mês 1) → Cloud API Meta (mês 2+)
- **Checkout**: [Kirvano](https://kirvano.com) (order bumps nativos, PIX + cartão)

---

## Como rodar localmente

```bash
cd zegrana
cp .env.example .env.local
# preencha as variáveis (Supabase local com `supabase start` ou projeto remoto)

npm install
npm run dev
```

Abre em http://localhost:3000.

### Subindo o banco

```bash
# Pré-requisito: Supabase CLI instalado
supabase start
supabase db reset     # aplica migrations em /supabase/migrations
```

### Configurando o bot Telegram

```bash
# 1. Crie um bot no @BotFather e copie o token
# 2. Aponte o webhook
curl -F "url=https://seu-dominio.com/api/bot/telegram" \
     -F "secret_token=$TELEGRAM_WEBHOOK_SECRET" \
     "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook"
```

### Configurando o bot WhatsApp (Evolution API)

Ver `docs/RUNBOOK.md` (em construção).

---

## Estrutura

```
zegrana/
├── app/
│   ├── page.tsx                 Landing (Hero, Features, Pricing, FAQ)
│   ├── obrigado/page.tsx        Thank-you page pós-checkout
│   ├── app/page.tsx             Dashboard skeleton
│   └── api/
│       ├── bot/telegram/        Webhook Telegram
│       ├── bot/whatsapp/        Webhook Evolution API
│       └── webhooks/kirvano/    Liberação de conta pós-pagamento
├── components/                  Componentes da landing
├── lib/
│   ├── supabase/                Clientes server/browser/admin
│   ├── parser/                  Prompts + chamada ao Claude Haiku
│   └── bot/                     Clientes Telegram/Evolution API
├── supabase/
│   ├── migrations/0001_init.sql Schema inicial (users, tx, cards, goals, RLS)
│   └── seed.sql                 Ref de categorias padrão
└── docs/                        Arquitetura, runbook, prompts
```

---

## Estado atual (mês 1 — MVP)

### ✅ Pronto
- Scaffold Next.js 15 + Tailwind + estrutura de pastas
- Landing page completa com copy de conversão, pricing toggle, FAQ, chat mockup
- Schema Postgres completo com RLS
- Stubs de webhook Telegram, WhatsApp e Kirvano
- Prompt Claude Haiku com few-shot cacheado
- Dashboard skeleton com KPIs mock

### 🚧 Próxima iteração
- Auth via magic link (fluxo completo de onboarding)
- Persistência real das transações (confirmação por botão inline)
- Transcrição de áudio (Groq Whisper)
- Gráficos Recharts com dados live
- Lembretes proativos (resumo mensal, fatura)
- Integração Kirvano (criar conta ao pagar)
- Multi-turn do bot (correção, parcelas, categorias custom)

Ver plano completo em [../docs/ze-grana-plano.pdf](../docs/ze-grana-plano.pdf).

---

## Comandos úteis

```bash
npm run dev          # dev server
npm run build        # build de produção
npm run start        # servir build
npm run lint         # ESLint
npm run typecheck    # TypeScript sem emitir
```

---

## Licença

Proprietário · Paiol Mídias LTDA
