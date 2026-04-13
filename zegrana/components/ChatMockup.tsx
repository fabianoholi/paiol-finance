export function ChatMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[360px] rounded-[36px] border border-ink-200 bg-ink-950 p-2 shadow-pop">
      <div className="relative overflow-hidden rounded-[30px] bg-[#0b141a]">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-white/5 bg-[#1f2c34] px-4 py-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-grad text-sm font-bold text-white">
            ZG
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">Zé Grana</div>
            <div className="text-[11px] text-emerald-300">online</div>
          </div>
        </div>

        {/* Messages */}
        <div
          className="space-y-2.5 bg-[#0b141a] px-4 py-5"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          <Bubble side="out">gastei 50 no mercado no crédito nubank</Bubble>
          <Bubble side="in">
            ✅ <b>R$ 50,00</b> em <b>Mercado</b>
            <br />
            <span className="text-emerald-300">Nubank crédito</span> · hoje
            <br />
            <span className="text-xs text-white/60">Tá certo? Toque em Sim ou corrija.</span>
            <div className="mt-2 flex gap-2">
              <BtnChip>✓ Sim</BtnChip>
              <BtnChip>✎ Corrigir</BtnChip>
            </div>
          </Bubble>
          <Bubble side="out">quanto eu já gastei esse mês?</Bubble>
          <Bubble side="in">
            Você gastou <b>R$ 1.847,20</b> em abril.
            <br />
            Top categoria: <b>Mercado</b> (R$ 612).
            <br />
            Ver detalhes → <u className="text-emerald-300">zegrana.com.br/app</u>
          </Bubble>
        </div>
      </div>
      {/* Phone notch */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 h-6 w-32 rounded-b-2xl bg-ink-950" />
    </div>
  );
}

function Bubble({
  children,
  side,
}: {
  children: React.ReactNode;
  side: "in" | "out";
}) {
  const isOut = side === "out";
  return (
    <div className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-snug shadow ${
          isOut
            ? "rounded-br-sm bg-[#005c4b] text-white"
            : "rounded-bl-sm bg-[#1f2c34] text-white/95"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function BtnChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white">
      {children}
    </span>
  );
}
