import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * Webhook Kirvano — libera/renova/cancela conta após eventos de pagamento.
 *
 * Eventos relevantes:
 *   - SALE_APPROVED       → criar/ativar usuário, plan=annual|monthly
 *   - SALE_REFUNDED       → status=canceled
 *   - SUBSCRIPTION_RENEWED → renews_at atualizado
 *   - SUBSCRIPTION_CANCELED → status=canceled
 *
 * Validar assinatura HMAC via header X-Kirvano-Signature (ou similar —
 * checar docs atualizadas ao configurar).
 */

type KirvanoEvent = {
  event: string;
  sale_id?: string;
  customer?: {
    email?: string;
    phone_number?: string;
    document?: string;
    name?: string;
  };
  plan?: { id?: string; name?: string };
  subscription?: { id?: string; next_charge?: string };
  offers?: Array<{ id: string; name: string; price: number }>;
};

export async function POST(req: Request) {
  const secret = process.env.KIRVANO_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-kirvano-signature") ?? "";

  // Verificação HMAC (ajustar algoritmo conforme doc atualizada)
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  if (!timingSafeEqual(signature, expected)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(raw) as KirvanoEvent;
  const sb = getSupabaseAdminClient();

  // Idempotência
  const externalId = payload.sale_id ?? crypto.randomUUID();
  const { data: existing } = await sb
    .from("webhook_events")
    .select("id, processed_at")
    .eq("source", "kirvano")
    .eq("external_id", externalId)
    .maybeSingle();

  if (existing?.processed_at) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  await sb.from("webhook_events").upsert(
    {
      source: "kirvano",
      external_id: externalId,
      payload: payload as unknown as Record<string, unknown>,
    },
    { onConflict: "source,external_id" },
  );

  try {
    switch (payload.event) {
      case "SALE_APPROVED":
        // TODO: criar/atualizar usuário, enviar bot magic link / boas-vindas
        break;
      case "SUBSCRIPTION_RENEWED":
        // TODO: atualizar renews_at
        break;
      case "SALE_REFUNDED":
      case "SUBSCRIPTION_CANCELED":
        // TODO: marcar status=canceled
        break;
      default:
        // evento não-tratado — apenas log
        break;
    }

    await sb
      .from("webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("source", "kirvano")
      .eq("external_id", externalId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    await sb
      .from("webhook_events")
      .update({ error: (e as Error).message })
      .eq("source", "kirvano")
      .eq("external_id", externalId);
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}
