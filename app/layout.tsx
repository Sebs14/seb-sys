import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { LangProvider } from "@/lib/i18n";
import { CrtOverlay } from "@/components/crt-overlay";
import { Starfield } from "@/components/ascii/starfield";
import { Cat } from "@/components/ascii/cat";
import { Matrix } from "@/components/ascii/matrix";
import { Terminal } from "@/components/ascii/terminal";
import { Train } from "@/components/ascii/train";
import { VHold } from "@/components/ascii/vhold";
import { VimTrap } from "@/components/ascii/vim-trap";
import { Screensaver } from "@/components/ascii/screensaver";
import { Poweroff } from "@/components/ascii/poweroff";
import { identity } from "@/lib/content";
import "./globals.css";

/* JetBrains Mono: de las monoespaciadas gratis, la que mejor cubre
   box-drawing (┌─┤) y bloques (░▒▓█) sin caer en fuente fallback,
   que es lo que rompe una grilla de caracteres. */
const mono = JetBrains_Mono({
  variable: "--font-term-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(identity.site),
  title: {
    default: `${identity.name} — ${identity.role.es}`,
    template: `%s — ${identity.name}`,
  },
  description:
    "Portafolio renderizado enteramente en caracteres. Desarrollo de software, sistemas y experimentos de interfaz.",
  openGraph: {
    type: "website",
    title: `${identity.name} — ${identity.role.es}`,
    description: "Portafolio renderizado enteramente en caracteres.",
    siteName: "seb.sys",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#080b08",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${mono.variable} h-full`}>
      <body className="min-h-full antialiased">
        <LangProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-[2ch] focus:top-[var(--lh)] focus:z-[200] focus:bg-term-bg focus:px-[1ch] focus:text-term-green"
          >
            Saltar al contenido principal
          </a>
          <Starfield />
          {children}
          <Cat />
          <Train />
          <Matrix />
          <Terminal />
          <VHold />
          <VimTrap />
          <Screensaver />
          <Poweroff />
          <CrtOverlay />
        </LangProvider>
      </body>
    </html>
  );
}
