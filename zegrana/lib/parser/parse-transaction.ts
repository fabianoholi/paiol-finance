import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { buildMessages } from "./prompts";

export const ParsedIntentSchema = z.object({
  intent: z.enum([
    "record_transaction",
    "balance_query",
    "month_summary",
    "greeting",
    "help",
    "unknown",
  ]),
  type: z.enum(["expense", "income", "transfer"]).nullable(),
  amount: z.number().positive().nullable(),
  category: z.string().nullable(),
  account_hint: z.string().nullable(),
  payment_method: z
    .enum(["cash", "pix", "debit", "credit", "transfer"])
    .nullable(),
  date: z.string().nullable(), // "YYYY-MM-DD" or null → today
  parcels: z.number().int().positive().nullable(),
  description: z.string().nullable(),
  confidence: z.enum(["high", "medium", "low"]),
  needs_clarification: z.string().nullable(),
});

export type ParsedIntent = z.infer<typeof ParsedIntentSchema>;

let client: Anthropic | null = null;
function getClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return client;
}

/**
 * Classifica e extrai dados de uma mensagem do usuário.
 * Usa Claude Haiku 4.5 com prompt caching pra custo mínimo.
 */
export async function parseTransaction(userMessage: string): Promise<ParsedIntent> {
  const { system, messages } = buildMessages(userMessage);

  const res = await getClient().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    system,
    messages,
    temperature: 0,
  });

  const textBlock = res.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Parser: resposta vazia do Claude");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(textBlock.text);
  } catch (e) {
    throw new Error(`Parser: JSON inválido do Claude: ${textBlock.text.slice(0, 200)}`);
  }

  const parsed = ParsedIntentSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Parser: schema inválido: ${parsed.error.message}`);
  }
  return parsed.data;
}
