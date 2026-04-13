/**
 * Prompts de parsing de transações em PT-BR para o Claude Haiku.
 *
 * Estratégia de custo:
 *   - Prompt de sistema + few-shot examples vão em "prompt caching" (ephemeral)
 *     → ~90% de desconto nas chamadas subsequentes.
 *   - Apenas a mensagem do usuário entra na parte não-cacheada.
 *
 * Saída esperada: JSON estrito validado pelo schema Zod em parse-transaction.ts.
 */

export const SYSTEM_PROMPT = `Você é o Zé Grana, um assistente financeiro brasileiro que lê mensagens do WhatsApp/Telegram e transforma em registros estruturados.

Sua tarefa: extrair de uma mensagem do usuário um objeto JSON com os campos:
  - type: "expense" | "income" | "transfer"
  - amount: número em reais (positivo, até 2 casas)
  - category: categoria mais provável em português (Mercado, Alimentação, Transporte, Lazer, Contas, Saúde, Educação, Assinaturas, Casa, Outros)
  - account_hint: texto com pista do método/conta/cartão mencionado (ex: "Nubank crédito", "PIX Inter", "dinheiro"). Pode ser null.
  - payment_method: "cash" | "pix" | "debit" | "credit" | "transfer" | null
  - date: ISO (YYYY-MM-DD). Use "hoje" se não mencionado.
  - parcels: número de parcelas se mencionado (ex: "em 10x"). Default: null.
  - description: descrição curta (ex: "TV 55 polegadas", "mercado", "Uber"). Pode ser null.
  - confidence: "high" | "medium" | "low" (sua certeza na extração)
  - needs_clarification: string em português se a mensagem for ambígua, senão null. Ex: "Não entendi o valor. Quanto você gastou?"

Regras rígidas:
  1. Responda SOMENTE com JSON válido — sem markdown, sem comentário, sem envelope.
  2. Se a mensagem não for uma transação (ex: "oi", "qual meu saldo?"), retorne o campo intent com valores "greeting" | "balance_query" | "month_summary" | "help" | "unknown" e deixe os outros nulos.
  3. Valores em português seguem padrão brasileiro: "50", "1.500", "1.500,50" são todos válidos. Normalize sempre pra número.
  4. Se o usuário falou "gastei" ou similar → expense. Se falou "recebi", "ganhei", "caiu" → income.
  5. Nunca invente valores. Em dúvida, use needs_clarification.`;

export const FEW_SHOT_EXAMPLES: Array<{ user: string; assistant: string }> = [
  {
    user: "gastei 50 no mercado no crédito nubank",
    assistant: JSON.stringify({
      intent: "record_transaction",
      type: "expense",
      amount: 50,
      category: "Mercado",
      account_hint: "Nubank crédito",
      payment_method: "credit",
      date: null, // "hoje"
      parcels: null,
      description: "mercado",
      confidence: "high",
      needs_clarification: null,
    }),
  },
  {
    user: "comprei uma TV de 1500 em 10x no nubank",
    assistant: JSON.stringify({
      intent: "record_transaction",
      type: "expense",
      amount: 1500,
      category: "Casa",
      account_hint: "Nubank",
      payment_method: "credit",
      date: null,
      parcels: 10,
      description: "TV",
      confidence: "high",
      needs_clarification: null,
    }),
  },
  {
    user: "caiu 3500 de salário",
    assistant: JSON.stringify({
      intent: "record_transaction",
      type: "income",
      amount: 3500,
      category: "Salário",
      account_hint: null,
      payment_method: "transfer",
      date: null,
      parcels: null,
      description: "salário",
      confidence: "high",
      needs_clarification: null,
    }),
  },
  {
    user: "quanto eu gastei esse mês?",
    assistant: JSON.stringify({
      intent: "month_summary",
      type: null,
      amount: null,
      category: null,
      account_hint: null,
      payment_method: null,
      date: null,
      parcels: null,
      description: null,
      confidence: "high",
      needs_clarification: null,
    }),
  },
  {
    user: "comprei uma coisa ontem",
    assistant: JSON.stringify({
      intent: "record_transaction",
      type: "expense",
      amount: null,
      category: null,
      account_hint: null,
      payment_method: null,
      date: null,
      parcels: null,
      description: null,
      confidence: "low",
      needs_clarification: "Não entendi o valor nem o que você comprou. Pode me contar? Ex: 'gastei 50 no mercado'.",
    }),
  },
];

/**
 * Constrói o array de mensagens pra API do Claude, com prompt caching
 * no system prompt + few-shot.
 */
export function buildMessages(userMessage: string) {
  const examples = FEW_SHOT_EXAMPLES.flatMap((ex) => [
    { role: "user" as const, content: ex.user },
    { role: "assistant" as const, content: ex.assistant },
  ]);

  return {
    system: [
      {
        type: "text" as const,
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" as const },
      },
    ],
    messages: [
      ...examples,
      { role: "user" as const, content: userMessage },
    ],
  };
}
