"use client";

import { useCallback, useState, type CSSProperties } from "react";
import { useLang } from "@/lib/i18n";
import { identity, hero } from "@/lib/content";
import { LiquidHeadline, PALETTES, type LiquidPalette } from "@/components/fx/liquid-headline";

/* ══════════════════════════════════════════════════════════════
   PORTADA

   Una sola idea por pantalla: el titular ES la imagen. Rol y país
   arriba, el saludo con el nombre en líquido al centro, la bajada y
   dos acciones. Detrás, un resplandor que toma el color de la paleta
   activa y una retícula de puntos que se disuelve. Todo el texto es
   HTML desde el primer render; el WebGL llega encima y no mueve nada.
   ══════════════════════════════════════════════════════════════ */

export function Hero() {
  const { b, t } = useLang();
  const [glow, setGlow] = useState<string>(PALETTES[0][1]);
  const onPalette = useCallback((p: LiquidPalette) => setGlow(p[1]), []);

  return (
    <section className="hero" aria-labelledby="hero-title" style={{ "--glow": glow } as CSSProperties}>
      <div aria-hidden className="hero-backdrop" />
      <div className="container-x">
        <p className="hero-kicker t-ui">
          <span className="text-ink">{b(identity.role)}</span>
          <span aria-hidden className="text-ink-3">
            ·
          </span>
          {b(identity.location)}
        </p>
        <LiquidHeadline
          id="hero-title"
          lines={hero.headline.map(b)}
          palettes={PALETTES}
          onPaletteChange={onPalette}
          className="mt-7"
        />
        <p className="t-lead hero-lead mt-7 text-ink-2">{b(hero.lead)}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="#work" className="btn btn-primary">
            {t("hero.viewProjects")}
          </a>
          <a href="#contact" className="btn btn-secondary">
            {t("hero.contact")}
          </a>
        </div>
      </div>
    </section>
  );
}
