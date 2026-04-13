# Arquitetura · Zé Grana

## Fluxo principal: registrar transação via bot

```
[Usuário WhatsApp ou Telegram]
        │
        ▼
[Telegram Bot API  |  Evolution API webhook]
        │  HTTPS POST
        ▼
[/api/bot/telegram  ou  /api/bot/whatsapp]
        │
        ├── Valida secret do header
        ├── Upsert em webhook_events (idempotência)
        ├── Identifica usuário (phone ou telegram_id)
        ├── Checa plano ativo (senão responde paywall)
        │
        ▼
[parseTransaction()] ── Claude Haiku 4.5 (prompt cached)
        │
        ▼
[Fluxo baseado em intent]
   ├── record_transaction → insere em transactions (confirmed_at=null)
   │                        → envia mensagem com botão Sim/Corrigir
   │                        → salva bot_session.last_tx_id
   ├── balance_query      → consulta sum + responde
   ├── month_summary      → consulta agregada + responde
   └── greeting/help      → resposta canned

[Usuário aperta "Sim"]
   → /api/bot/telegram recebe callback_query
   → UPDATE transactions SET confirmed_at = now() WHERE id = tx_id
   → responde "👍 anotado"
```

## Fluxo de compra

```
[Landing /#precos] → [Kirvano checkout externo]
                      │
                      ▼ webhook SALE_APPROVED
                [/api/webhooks/kirvano]
                      ├── valida HMAC
                      ├── cria public.users (phone do checkout)
                      ├── gera magic link de dashboard
                      └── envia WhatsApp de boas-vindas
                                  │
                                  ▼
                    [Usuário recebe WhatsApp]
                    "👋 Bem-vindo! Manda seu primeiro gasto pra ver como funciona."
```

## Multi-turn (state machine do bot)

Estados em `bot_sessions.state`:

- `idle` — aceita qualquer mensagem nova
- `onboarding_cards` — perguntando quais cartões o usuário tem
- `onboarding_categories` — sugerindo/confirmando categorias padrão
- `awaiting_confirmation` — esperando Sim/Corrigir do último tx
- `editing_tx` — usuário disse "corrigir", esperando qual campo
- `awaiting_amount` — clarification de valor faltante

## Custo por usuário/mês (estimativa)

| Item | Qtd | Unit | Total |
|---|---|---|---|
| Mensagens parseadas | 100 | R$ 0,002 | R$ 0,20 |
| Transcrição áudio (20%) | 20 | R$ 0,01 | R$ 0,20 |
| Infra fixa (amortizada) | — | — | R$ 0,15 |
| Checkout Kirvano (1x/mês anual = 0,08 amortizado) | — | — | R$ 0,08 |
| **Custo total estimado** | | | **~R$ 0,63/mês** |
| **Margem por pagante (anual)** | | | R$ 8,08 − 0,63 = **R$ 7,45/mês** |

## Decisões arquiteturais

### Por que Supabase e não Prisma + DB próprio?
RLS nativa + Auth + Realtime + Storage num único serviço. Economia operacional enorme pra 1-5k usuários iniciais.

### Por que Next.js tudo-num-só e não microserviços?
Bot e web têm tráfego baixo individual, SLA similar. Vercel escala automaticamente. Microserviço = complexidade prematura.

### Por que Claude Haiku e não GPT-4o-mini?
Custo similar, qualidade PT-BR superior, prompt caching mais agressivo (90% off, vs 50% OpenAI).

### Por que sem trial?
Sem trial corta leads de baixa qualidade, força commitment, reduz custo de API em tire-kickers, e é o padrão do mercado BR de infoproduto/SaaS via Kirvano/Cakto.
