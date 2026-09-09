"use client";

import dynamic from "next/dynamic";
import { useLang } from "@/lib/i18n";
import { EffectsHost } from "@/components/ascii/effects-host";

/* Lo que vive fuera de la página: la terminal, los efectos voluntarios
   y el enlace para saltar al contenido. La terminal se carga bajo
   demanda: su código no entra en el camino crítico del texto. */
const Terminal = dynamic(() => import("@/components/ascii/terminal").then((m) => m.Terminal), {
  ssr: false,
});

export function SkipLink() {
  const { t } = useLang();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] btn btn-primary btn-sm"
    >
      {t("a11y.skip")}
    </a>
  );
}

export function SiteChrome() {
  return (
    <>
      <Terminal />
      <EffectsHost />
    </>
  );
}
