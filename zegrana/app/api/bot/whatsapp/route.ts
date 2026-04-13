import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { parseTransaction } from "@/lib/parser/parse-transaction";

/**
 * Webhook WhatsApp via Evolution API.
 *
 * Formato típico do payload Evolution:
 *   {
 *     event: "messages.upsert",
 *     instance: "zegrana",
 *     data: {
 *       key: { remoteJid, fromMe, id },
 *       message: { conversation: "texto" | extendedTextMessage: { text } | audioMessage: {...} },
 *       messageTimestamp,
 *       pushName
 *     }
 *   }
 *
 * Stub inicial — mirror do webhook Telegram, mas com cliente Evolution.
 */

type EvoPayload = {
  event: string;
  instance: string;
  data?: {
    key?: { remoteJid?: string; fromMe?: boolean; id?: string };
    message?: {
      conversation?: string;
      extendedTextMessage?: { text?: string };
      audioMessage?: unknown;
    };
    pushName?: string;
  };
};

export async function POST(req: Request) {
  // Validação: secret via header customizado da Evolution
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.WHATSAPP_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as EvoPayload;

  try {
    const sb = getSupabaseAdminClient();
    const msgId = payload.data?.key?.id ?? crypto.randomUUID();
    await sb.from("webhook_events").upsert(
      {
        source: "whatsapp",
        external_id: msgId,
        payload: payload as unknown as Record<string, unknown>,
      },
      { onConflict: "source,external_id", ignoreDuplicates: true },
    );

    // Só processa mensagens recebidas (não ecos nossos)
    if (payload.event !== "messages.upsert" || payload.data?.key?.fromMe) {
      return NextResponse.json({ ok: true });
    }

    const jid = payload.data?.key?.remoteJid ?? "";
    const text =
      payload.data?.message?.conversation ??
      payload.data?.message?.extendedTextMessage?.text ??
      "";

    if (!text) {
      // TODO: áudio → transcrição (Groq Whisper ou OpenAI)
      await sendWhatsApp(jid, "🎧 Áudio ainda não é suportado nesta versão. Manda em texto, por favor!");
      return NextResponse.json({ ok: true });
    }

    const parsed = await parseTransaction(text);

    if (parsed.intent === "record_transaction" && parsed.amount) {
      await sendWhatsApp(
        jid,
        `✅ R$ ${parsed.amount.toFixed(2)} em ${parsed.category ?? "Outros"}${parsed.account_hint ? `\n${parsed.account_hint}` : ""}\n\n(stub — persistência na próxima iteração)`,
      );
    } else if (parsed.needs_clarification) {
      await sendWhatsApp(jid, parsed.needs_clarification);
    } else {
      await sendWhatsApp(jid, "Não consegui registrar. Tenta: 'gastei 30 no uber' 👍");
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("whatsapp webhook error", e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "whatsapp webhook alive" });
}

/**
 * Envia mensagem via Evolution API.
 */
async function sendWhatsApp(jid: string, text: string) {
  const url = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE ?? "zegrana";
  if (!url || !apiKey) {
    console.warn("EVOLUTION_API_URL ou EVOLUTION_API_KEY não configurados; mensagem não enviada:", text);
    return;
  }
  await fetch(`${url}/message/sendText/${instance}`, {
    method: "POST",
    headers: {
      apikey: apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({ number: jid, text }),
  });
}
