import Link from "next/link";

export const metadata = {
  title: "Obrigado pela compra · Zé Grana",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  const waNumber = process.env.NEXT_PUBLIC_BOT_WHATSAPP_NUMBER ?? "5511900000000";
  const tgBot = process.env.NEXT_PUBLIC_BOT_USERNAME_TG ?? "ZeGranaBot";

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <div className="container-x flex min-h-screen flex-col items-center justify-center py-20 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-grad text-3xl text-white shadow-pop">
          ✓
        </div>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight md:text-5xl">
          Boas-vindas ao time! 🎉
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink-600">
          Sua compra foi confirmada. Agora é só puxar papo com o Zé. Escolhe o canal que
          você mais usa:
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Oi Zé, acabei de comprar!")}`}
            className="btn-primary"
          >
            Abrir no WhatsApp →
          </a>
          <a href={`https://t.me/${tgBot}`} className="btn-ghost">
            Abrir no Telegram →
          </a>
        </div>
        <p className="mt-8 text-sm text-ink-500">
          Problema pra acessar? Fala com a gente em{" "}
          <a href="mailto:oi@zegrana.com.br" className="text-brand-700 underline">
            oi@zegrana.com.br
          </a>
          .
        </p>
        <Link href="/" className="mt-6 text-sm text-ink-500 hover:text-brand-700">
          ← voltar pro site
        </Link>
      </div>
    </main>
  );
}
