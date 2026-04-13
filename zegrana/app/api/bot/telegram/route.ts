import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import {
  sendMessage,
  type TelegramUpdate,
  confirmInlineKeyboard,
} from "@/lib/bot/telegram";
import { parseTransaction } from "@/lib/parser/parse-transaction";

/**
 * Webhook do Telegram.
 * Configurar via:
 *   curl -F "url=https://zegrana.com.br/api/bot/telegram" \
 *        -F "secret_token=$TELEGRAM_WEBHOOK_SECRET" \
 *        https://api.telegram.org/bot$TOKEN/setWebhook
 *
 * Este é o stub inicial — fluxo completo de onboarding, confirmação e
 * persistência será implementado na próxima iteração.
 */

export async function POST(req: Request) {
  // 1. Valida secret token (Telegram envia no header)
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const update = (await req.json()) as TelegramUpdate;

  try {
    // Idempotência: guarda update_id
    const sb = getSupabaseAdminClient();
    await sb.from("webhook_events").upsert(
      {
        source: "telegram",
        external_id: String(update.update_id),
        payload: update as unknown as Record<string, unknown>,
      },
      { onConflict: "source,external_id", ignoreDuplicates: true },
    );

    // --- Mensagem de texto ---
    if (update.message?.text && update.message.from) {
      const chatId = update.message.chat.id;
      const text = update.message.text.trim();

      // Comandos simples (stubs — implementação completa em iteração seguinte)
      if (text === "/start") {
        await sendMessage(
          chatId,
          "👋 Oi! Eu sou o Zé Grana. Manda um gasto pra mim, tipo:\n\n_gastei 50 no mercado no crédito_\n\nTe mostro como registro.",
          { parse_mode: "Markdown" },
        );
        return NextResponse.json({ ok: true });
      }

      if (text === "/saldo" || text === "/mes" || text === "/site") {
        await sendMessage(chatId, "⚙️ Em construção. Vem aí na próxima versão.");
        return NextResponse.json({ ok: true });
      }

      // Parseia com Claude
      const parsed = await parseTransaction(text);

      if (parsed.intent === "record_transaction" && parsed.amount) {
        // TODO: persistir transação + responder com inline keyboard
        await sendMessage(
          chatId,
          `✅ *R$ ${parsed.amount.toFixed(2)}* em *${parsed.category ?? "Outros"}*` +
            (parsed.account_hint ? `\n_${parsed.account_hint}_` : "") +
            `\n\n_(stub — persistência na próxima iteração)_`,
          {
            parse_mode: "Markdown",
            reply_markup: confirmInlineKeyboard("stub-id"),
          },
        );
      } else if (parsed.needs_clarification) {
        await sendMessage(chatId, parsed.needs_clarification);
      } else {
        await sendMessage(
          chatId,
          "Entendi que você mandou algo, mas não consegui registrar. Tenta de novo com valor e categoria, tipo: _gastei 30 no uber_",
          { parse_mode: "Markdown" },
        );
      }
    }

    // --- Callback (botões inline) ---
    if (update.callback_query) {
      // TODO: handle confirm/edit
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("telegram webhook error", e);
    return NextResponse.json({ ok: false }, { status: 200 }); // 200 pro Telegram não reencaminhar
  }
}

export async function GET() {
  return NextResponse.json({ status: "telegram webhook alive" });
}
