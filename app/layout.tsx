import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { LangProvider } from "@/lib/i18n";
import { identity } from "@/lib/content";
import { SiteChrome, SkipLink } from "@/components/site/site-chrome";
import "./globals.css";

/* Inter como alternativa autoalojada del stack de sistema Apple:
   next/font la descarga en el build y la sirve desde el propio sitio;
   ningún CDN en tiempo de visita. JetBrains Mono queda para terminal,
   metadatos técnicos y ASCII. */
/* `optional`: en Apple el stack de sistema va primero y la fuente ni se
   usa; en Android/Windows, si Inter no llega en el primer bloque de
   render, el título se queda con la fuente de sistema en vez de
   repintarse tarde (eso movía el LCP varios segundos en red lenta). */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "optional",
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const DESCRIPTION = {
  es: "Portafolio de Sebastián Flores, ingeniero de software en El Salvador. Una escultura Three.js de siete piezas se abre en los sistemas que ha construido: backend, interfaces y todo lo que hay en medio.",
  en: "Portfolio of Sebastián Flores, software engineer in El Salvador. A seven-piece Three.js sculpture opens into the systems he has built: backend, interfaces, and everything in between.",
};

export const metadata: Metadata = {
  /* Sólo el origen: Next ya antepone `basePath` a los archivos de
     metadatos (icon, opengraph-image). Con la URL completa el basePath
     salía dos veces (`/seb-sys/seb-sys/opengraph-image.png`). */
  metadataBase: new URL(new URL(identity.site).origin),
  title: {
    default: `${identity.name} — ${identity.role.es}`,
    template: `%s — ${identity.name}`,
  },
  description: DESCRIPTION.es,
  openGraph: {
    type: "website",
    title: `${identity.name} — ${identity.role.es}`,
    description: DESCRIPTION.es,
    siteName: "seb.sys",
    locale: "es_SV",
    alternateLocale: ["en_US"],
    url: identity.site,
  },
  twitter: {
    card: "summary_large_image",
    title: `${identity.name} — ${identity.role.es}`,
    description: DESCRIPTION.es,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#090b0d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} ${mono.variable} h-full`}>
      <body className="min-h-full antialiased">
        <LangProvider>
          <SkipLink />
          {children}
          <SiteChrome />
        </LangProvider>
      </body>
    </html>
  );
}
