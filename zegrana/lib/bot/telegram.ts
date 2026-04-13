/**
 * Cliente minimalista para a Bot API do Telegram.
 * Evita dependência extra (node-telegram-bot-api é pesado).
 */

const BASE = "https://api.telegram.org";

function token() {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN não configurado");
  return t;
}

async function call<T = unknown>(method: string, payload: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE}/bot${token()}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = (await res.json()) as { ok: boolean; result?: T; description?: string };
  if (!json.ok) throw new Error(`Telegram ${method}: ${json.description}`);
  return json.result as T;
}

export function sendMessage(
  chatId: number | string,
  text: string,
  opts: {
    parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
    reply_markup?: unknown;
  } = {},
) {
  return call("sendMessage", { chat_id: chatId, text, ...opts });
}

export function confirmInlineKeyboard(txId: string) {
  return {
    inline_keyboard: [
      [
        { text: "✓ Sim, está certo", callback_data: `confirm:${txId}` },
        { text: "✎ Corrigir", callback_data: `edit:${txId}` },
      ],
    ],
  };
}

/** Tipos mínimos do Telegram Update que nos interessam. */
export type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    from?: { id: number; first_name?: string; username?: string };
    chat: { id: number };
    date: number;
    text?: string;
    voice?: { file_id: string; duration: number; mime_type?: string };
  };
  callback_query?: {
    id: string;
    from: { id: number };
    data?: string;
    message?: { chat: { id: number } };
  };
};
