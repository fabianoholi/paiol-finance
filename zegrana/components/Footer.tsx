export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white py-14">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-grad font-bold text-white">
                Z
              </span>
              <span className="text-lg font-bold">Zé Grana</span>
            </div>
            <p className="mt-3 text-sm text-ink-500">
              Finanças pessoais via WhatsApp e Telegram. Sem planilha, sem fricção, sem desculpa.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm md:grid-cols-3">
            <div>
              <div className="font-semibold text-ink-800">Produto</div>
              <ul className="mt-3 space-y-2 text-ink-500">
                <li><a href="#como-funciona" className="hover:text-brand-700">Como funciona</a></li>
                <li><a href="#recursos" className="hover:text-brand-700">Recursos</a></li>
                <li><a href="#precos" className="hover:text-brand-700">Preço</a></li>
                <li><a href="#faq" className="hover:text-brand-700">FAQ</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-ink-800">Legal</div>
              <ul className="mt-3 space-y-2 text-ink-500">
                <li><a href="/termos" className="hover:text-brand-700">Termos de uso</a></li>
                <li><a href="/privacidade" className="hover:text-brand-700">Privacidade</a></li>
                <li><a href="/lgpd" className="hover:text-brand-700">LGPD</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-ink-800">Contato</div>
              <ul className="mt-3 space-y-2 text-ink-500">
                <li><a href="mailto:oi@zegrana.com.br" className="hover:text-brand-700">oi@zegrana.com.br</a></li>
                <li><a href="https://wa.me/5511900000000" className="hover:text-brand-700">WhatsApp</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-ink-100 pt-6 text-xs text-ink-500 md:flex-row">
          <div>© {new Date().getFullYear()} Zé Grana · uma iniciativa Paiol Mídias</div>
          <div>Feito no Brasil · Pagamentos via Kirvano</div>
        </div>
      </div>
    </footer>
  );
}
