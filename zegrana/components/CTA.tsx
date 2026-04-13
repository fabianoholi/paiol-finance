export function CTA() {
  return (
    <section className="py-20">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-3xl bg-brand-grad px-8 py-16 text-center text-white shadow-pop md:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Bora tirar isso do piloto automático?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg opacity-90">
              Um ano de controle financeiro completo por menos do que você gasta em iFood numa semana.
            </p>
            <a
              href="#precos"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-brand-700 shadow transition hover:scale-[1.02]"
            >
              Quero o Zé cuidando disso →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
