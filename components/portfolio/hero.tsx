"use client";

import { useRef } from "react";
import { useLang } from "@/lib/i18n";
import { identity, hero } from "@/lib/content";
import { SceneShell } from "@/components/three/scene-shell";
import type { SceneApi } from "@/components/three/portfolio-scene";
import { SceneToolbar } from "./scene-toolbar";
import { ProjectChips, ProjectPreview } from "./project-explorer";

/* ══════════════════════════════════════════════════════════════
   PORTADA

   Una composición por viewport: texto a la izquierda (440–480 px),
   escultura a la derecha (~60 % del ancho). Nombre, rol, título y CTA
   son HTML visibles desde el primer render; la escena llega después y
   no mueve nada.
   ══════════════════════════════════════════════════════════════ */

export function Hero() {
  const { b, t } = useLang();
  const apiRef = useRef<SceneApi | null>(null);

  return (
    <section className="hero container-x" aria-labelledby="hero-title">
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="t-ui text-ink-2">
            <span className="text-ink">{identity.name}</span>
            <span aria-hidden className="mx-2 text-ink-3">
              ·
            </span>
            {b(identity.role)}
          </p>
          <h1 id="hero-title" className="t-display mt-5 text-ink">
            {b(hero.lines[0])}
          </h1>
          <p className="t-lead measure-narrow mt-6 text-ink-2">{b(hero.lines[1])}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#work" className="btn btn-primary">
              {t("hero.viewProjects")}
            </a>
            <a href="#contact" className="btn btn-secondary">
              {t("hero.contact")}
            </a>
          </div>
        </div>

        <div className="hero-scene">
          <SceneShell className="hero-scene-box" apiRef={apiRef} />
          <SceneToolbar apiRef={apiRef} />
          <ProjectChips className="mt-5" />
        </div>

        <div className="hero-preview">
          <ProjectPreview />
        </div>
      </div>
    </section>
  );
}
