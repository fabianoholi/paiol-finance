"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Como funciona na prática?",
    a: "Você se cadastra, o Zé te manda uma mensagem no WhatsApp ou Telegram e pede algumas infos iniciais (seus cartões, categorias). Daí em diante é só mandar: “gastei X no Y”. Ele confirma com 1 clique e pronto.",
  },
  {
    q: "Meu número de WhatsApp é seguro?",
    a: "Sim. Seu número é só o identificador da sua conta — não compartilhamos com ninguém. Todos os dados financeiros são criptografados e protegidos (LGPD).",
  },
  {
    q: "Preciso baixar algum app?",
    a: "Não. Você usa o WhatsApp ou Telegram que já tem, e o painel web abre em qualquer navegador (celular ou computador). Zero instalação.",
  },
  {
    q: "Funciona com áudio?",
    a: "Funciona. Você manda um áudio “gastei 80 reais no iFood” e o Zé transcreve, entende e registra. Ideal pra quem dirige ou tá de mãos ocupadas.",
  },
  {
    q: "E se o Zé interpretar errado?",
    a: "Todo registro vem com um botão “Corrigir” embutido na mensagem. Um toque e você ajusta categoria, conta ou valor. O Zé aprende com suas correções.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Pode. Cancelamento a qualquer momento, sem fidelidade. Se for mensal, para de cobrar no próximo mês. Se for anual, você usa até o fim do período já pago.",
  },
  {
    q: "Se eu parar de pagar, perco meus dados?",
    a: "Não. Você sempre consegue exportar tudo em CSV antes de cancelar. Mantemos seus dados por 90 dias após cancelar, caso você volte.",
  },
  {
    q: "Dá pra usar em família ou casal?",
    a: "Dá. No checkout tem o order bump “Modo Família” — você e mais uma pessoa compartilham a mesma conta, cada um registra pelo seu próprio WhatsApp.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip">Perguntas frequentes</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
            Tirando as dúvidas.
          </h2>
        </div>

        <div className="mx-auto mt-10 max-w-3xl divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white">
          {faqs.map((f, i) => (
            <FaqItem key={i} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      className="group"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-ink-900 transition hover:bg-ink-50/60">
        {q}
        <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-ink-100 text-ink-600 transition group-open:rotate-45 group-open:bg-brand-100 group-open:text-brand-700">
          +
        </span>
      </summary>
      <div className="px-6 pb-5 text-ink-600">{a}</div>
    </details>
  );
}
