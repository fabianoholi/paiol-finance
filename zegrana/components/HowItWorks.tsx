const steps = [
  {
    n: "1",
    title: "Você manda mensagem",
    body: "No WhatsApp ou Telegram. Texto ou áudio. Em português normal — do jeito que você fala.",
    example: '"gastei 50 no mercado no crédito"',
  },
  {
    n: "2",
    title: "O Zé entende",
    body: "Inteligência artificial identifica valor, categoria, conta e parcelas. Confirma com você em 1 clique.",
    example: "R$ 50 · Mercado · Nubank crédito",
  },
  {
    n: "3",
    title: "Tudo organizado",
    body: "Seu painel web atualiza ao vivo. Gráficos, metas, cartões, IR. Sem planilha. Sem trabalho.",
    example: "zegrana.com.br/app",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-y border-ink-100 bg-ink-50/50 py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip">Como funciona</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
            É literalmente mandar mensagem.
          </h2>
          <p className="mt-3 text-lg text-ink-600">
            A maioria dos apps de finanças é abandonada no primeiro mês por causa da fricção.
            O Zé Grana mora onde você já mora: no seu chat.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-ink-100 bg-white p-7 shadow-card"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-grad text-lg font-bold text-white">
                {s.n}
              </div>
              <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-ink-600">{s.body}</p>
              <div className="mt-5 rounded-lg bg-ink-50 px-4 py-3 font-mono text-sm text-ink-700">
                {s.example}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
