import { ChatMockup } from "./ChatMockup";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 to-white pt-10 pb-20 md:pt-16 md:pb-28">
      <div className="container-x grid items-center gap-12 md:grid-cols-2">
        <div>
          <span className="chip">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-brand-500" />
            Novo · Bot no WhatsApp e Telegram
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-900 md:text-6xl">
            Controle seu dinheiro{" "}
            <span className="bg-brand-grad bg-clip-text text-transparent">
              sem abrir app nenhum.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-600 md:text-xl">
            O <b>Zé Grana</b> é um bot que mora no seu WhatsApp.
            Você manda uma mensagem, ele registra, categoriza e monta seu painel
            financeiro automaticamente. Sem planilha. Sem formulário. Sem preguiça.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#precos" className="btn-primary">
              Começar por R$ 97/ano
              <span aria-hidden>→</span>
            </a>
            <a href="#como-funciona" className="btn-ghost">
              Ver como funciona
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-ink-500">
            <span className="flex items-center gap-2">
              <Check /> Pagamento único anual
            </span>
            <span className="flex items-center gap-2">
              <Check /> PIX ou cartão
            </span>
            <span className="flex items-center gap-2">
              <Check /> Cancela quando quiser
            </span>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md md:ml-auto">
          <ChatMockup />
        </div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
