"use client";

import { useState } from "react";

const checkoutUrls = {
  annual: process.env.NEXT_PUBLIC_KIRVANO_ANNUAL ?? "#",
  monthly: process.env.NEXT_PUBLIC_KIRVANO_MONTHLY ?? "#",
};

const included = [
  "Bot no WhatsApp e Telegram",
  "Registros ilimitados por texto e áudio",
  "Painel web com todos os gráficos",
  "Cartões, parcelas e faturas",
  "Metas por categoria + alertas",
  "Resumo mensal proativo",
  "Export CSV para IR",
  "Suporte por WhatsApp",
];

export function Pricing() {
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");

  const price = plan === "annual" ? "97" : "17";
  const period = plan === "annual" ? "/ano" : "/mês";
  const hint =
    plan === "annual"
      ? "Equivale a R$ 8,08/mês — economia de 52%."
      : "Cobrança recorrente mensal no cartão.";
  const ctaUrl =
    plan === "annual" ? checkoutUrls.annual : checkoutUrls.monthly;

  return (
    <section id="precos" className="bg-ink-50/60 py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip">Preço</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
            Um preço. Tudo incluído.
          </h2>
          <p className="mt-3 text-lg text-ink-600">
            Sem trial, sem pegadinha, sem upsell escondido. Paga e usa.
          </p>
        </div>

        <div className="mx-auto mt-8 inline-flex items-center gap-1 rounded-full bg-white p-1 shadow-card ring-1 ring-ink-100 block w-fit mx-auto">
          <button
            onClick={() => setPlan("annual")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              plan === "annual"
                ? "bg-brand-600 text-white shadow"
                : "text-ink-700 hover:text-brand-700"
            }`}
          >
            Anual <span className="ml-1 text-xs opacity-80">-52%</span>
          </button>
          <button
            onClick={() => setPlan("monthly")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              plan === "monthly"
                ? "bg-brand-600 text-white shadow"
                : "text-ink-700 hover:text-brand-700"
            }`}
          >
            Mensal
          </button>
        </div>

        <div className="mx-auto mt-10 max-w-lg overflow-hidden rounded-3xl bg-white shadow-pop ring-1 ring-ink-100">
          <div className="bg-brand-grad px-8 py-7 text-white">
            <div className="text-sm font-medium uppercase tracking-wider opacity-80">
              Plano {plan === "annual" ? "Anual" : "Mensal"}
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-semibold">R$</span>
              <span className="text-6xl font-extrabold tracking-tight">{price}</span>
              <span className="text-xl font-medium opacity-90">{period}</span>
            </div>
            <p className="mt-1 text-sm opacity-85">{hint}</p>
          </div>
          <div className="px-8 py-7">
            <ul className="space-y-3">
              {included.map((i) => (
                <li key={i} className="flex items-start gap-3 text-ink-800">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-none text-brand-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{i}</span>
                </li>
              ))}
            </ul>
            <a
              href={ctaUrl}
              className="btn-primary mt-8 w-full !py-4 !text-lg"
            >
              Começar por R$ {price}{period} →
            </a>
            <p className="mt-3 text-center text-xs text-ink-500">
              Pagamento seguro via Kirvano · PIX ou cartão · Cancela quando quiser
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
