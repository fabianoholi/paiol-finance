/**
 * Dashboard — apenas skeleton por enquanto.
 * Na próxima iteração: dados reais do Supabase, gráficos Recharts,
 * lista de transações, metas, cartões.
 */

export const metadata = {
  title: "Painel",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-ink-50/60">
      <div className="border-b border-ink-100 bg-white">
        <div className="container-x flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-grad font-bold text-white">
              Z
            </span>
            <span className="text-lg font-bold tracking-tight">Zé Grana</span>
            <span className="ml-2 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
              Beta
            </span>
          </div>
          <div className="text-sm text-ink-500">fulano@exemplo.com</div>
        </div>
      </div>

      <main className="container-x py-8">
        <div className="grid gap-5 md:grid-cols-3">
          <KpiCard label="Gasto do mês" value="R$ 1.847,20" delta="+18% vs mês passado" tone="down" />
          <KpiCard label="Receita do mês" value="R$ 5.400,00" delta="—" tone="flat" />
          <KpiCard label="Sobra" value="R$ 3.552,80" delta="66% da receita" tone="up" />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-ink-100 bg-white p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Gastos por mês</h2>
              <span className="text-sm text-ink-500">últimos 6 meses</span>
            </div>
            <ChartPlaceholder label="barras" />
          </div>
          <div className="rounded-2xl border border-ink-100 bg-white p-6">
            <h2 className="text-lg font-bold">Por categoria</h2>
            <ChartPlaceholder label="pizza" />
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Últimas transações</h2>
            <button className="text-sm font-semibold text-brand-700 hover:underline">
              Ver todas →
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-ink-500">
                <tr>
                  <th className="py-2 pr-4">Data</th>
                  <th className="py-2 pr-4">Descrição</th>
                  <th className="py-2 pr-4">Categoria</th>
                  <th className="py-2 pr-4">Conta</th>
                  <th className="py-2 pr-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {[
                  ["Hoje", "Mercado", "Alimentação", "Nubank crédito", "R$ 50,00"],
                  ["Ontem", "Uber", "Transporte", "PIX", "R$ 18,40"],
                  ["11/04", "iFood", "Alimentação", "Débito Inter", "R$ 62,00"],
                ].map((row, i) => (
                  <tr key={i}>
                    {row.slice(0, 4).map((c, j) => (
                      <td key={j} className="py-3 pr-4 text-ink-700">{c}</td>
                    ))}
                    <td className="py-3 pr-4 text-right font-semibold text-ink-900">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-brand-300 bg-brand-50/40 p-6 text-brand-800">
          <b>🚧 Skeleton:</b> gráficos reais e dados live do Supabase vêm na próxima iteração.
          Esta tela mostra a estrutura final esperada.
        </div>
      </main>
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "up" | "down" | "flat";
}) {
  const toneClass =
    tone === "up" ? "text-emerald-600" : tone === "down" ? "text-rose-600" : "text-ink-500";
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6">
      <div className="text-sm text-ink-500">{label}</div>
      <div className="mt-2 text-3xl font-extrabold tracking-tight">{value}</div>
      <div className={`mt-1 text-xs font-medium ${toneClass}`}>{delta}</div>
    </div>
  );
}

function ChartPlaceholder({ label }: { label: string }) {
  return (
    <div className="mt-4 grid h-52 place-items-center rounded-xl border border-dashed border-ink-200 bg-ink-50/60 text-ink-400">
      <div className="text-center">
        <div className="text-sm font-medium">gráfico de {label}</div>
        <div className="text-xs">Recharts · renderiza na próxima iteração</div>
      </div>
    </div>
  );
}
