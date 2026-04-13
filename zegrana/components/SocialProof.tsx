const stats = [
  { k: "5 min", v: "do cadastro ao primeiro registro" },
  { k: "≤ 3 s", v: "pro Zé entender sua mensagem" },
  { k: "100%", v: "em português, áudio e texto" },
];

export function SocialProof() {
  return (
    <section className="border-y border-ink-100 bg-white py-14">
      <div className="container-x">
        <div className="grid gap-8 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.k} className="text-center md:text-left">
              <div className="bg-brand-grad bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-5xl">
                {s.k}
              </div>
              <div className="mt-1 text-ink-600">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
