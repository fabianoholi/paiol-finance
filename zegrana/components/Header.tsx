import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/80 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-grad font-bold text-white">
            Z
          </span>
          <span className="text-lg font-bold tracking-tight">Zé Grana</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-700 md:flex">
          <a href="#como-funciona" className="hover:text-brand-700">Como funciona</a>
          <a href="#recursos" className="hover:text-brand-700">Recursos</a>
          <a href="#precos" className="hover:text-brand-700">Preço</a>
          <a href="#faq" className="hover:text-brand-700">FAQ</a>
        </nav>
        <a href="#precos" className="btn-primary !px-4 !py-2 !text-sm">
          Começar agora
        </a>
      </div>
    </header>
  );
}
