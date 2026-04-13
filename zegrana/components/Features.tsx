const features = [
  {
    icon: "💬",
    title: "Linguagem natural",
    body: "Texto ou áudio, do jeito que você fala. Sem menus, sem campos, sem formulário.",
  },
  {
    icon: "💳",
    title: "Cartões e parcelas",
    body: '"TV 1500 em 10x no Nubank" — o Zé divide em 10 lançamentos futuros automaticamente.',
  },
  {
    icon: "📊",
    title: "Painel com gráficos",
    body: "Pizza por categoria, barras por mês, timeline, metas. Atualiza em tempo real.",
  },
  {
    icon: "🔔",
    title: "Lembretes proativos",
    body: "Fatura do cartão, estouro de meta, resumo mensal. O Zé avisa antes de doer.",
  },
  {
    icon: "👥",
    title: "Modo família",
    body: "Compartilhe conta com cônjuge ou filho. Cada um registra pelo próprio WhatsApp.",
  },
  {
    icon: "🔒",
    title: "Seguro e privado",
    body: "Dados criptografados. Não compartilhamos nada. Você exporta e deleta quando quiser.",
  },
];

export function Features() {
  return (
    <section id="recursos" className="py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip">Recursos</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
            Tudo que você precisa. Nada do que não precisa.
          </h2>
          <p className="mt-3 text-lg text-ink-600">
            Zero aprendizado. Zero fricção. Se você sabe mandar mensagem no WhatsApp, você sabe usar.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-brand-200 hover:shadow-card"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 text-lg font-bold">{f.title}</h3>
              <p className="mt-1.5 text-ink-600">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
