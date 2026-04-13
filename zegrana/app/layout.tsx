import type { Metadata } from "next";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://zegrana.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Zé Grana — finanças pessoais no seu WhatsApp",
    template: "%s · Zé Grana",
  },
  description:
    "Controle seus gastos mandando mensagem no WhatsApp ou Telegram. O Zé registra, categoriza e mostra tudo num painel bonito.",
  keywords: [
    "controle financeiro",
    "finanças pessoais",
    "whatsapp finanças",
    "bot financeiro",
    "gestão de gastos",
    "app finanças",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: appUrl,
    title: "Zé Grana — finanças pessoais no seu WhatsApp",
    description:
      "Registre seus gastos por mensagem. O Zé cuida do resto. A partir de R$ 97/ano.",
    siteName: "Zé Grana",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zé Grana — finanças pessoais no seu WhatsApp",
    description:
      "Registre seus gastos por mensagem. O Zé cuida do resto.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
