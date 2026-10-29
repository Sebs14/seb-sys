"use client";

import { useRef } from "react";
import { useLang } from "@/lib/i18n";
import { SceneShell } from "@/components/three/scene-shell";
import type { SceneApi } from "@/components/three/portfolio-scene";
import { SceneToolbar } from "./scene-toolbar";
import { ProjectIndex, ProjectPreview } from "./project-explorer";
import { SectionHeader } from "./section-header";

/* ══════════════════════════════════════════════════════════════
   ESCENARIO

   La escultura de siete piezas dentro de un marco de doble bisel,
   como una pieza en exhibición: a un lado el índice de proyectos con
   regla y los controles de la escena; al otro la escena; abajo, la
   ficha del elegido. El índice HTML y la escena son la misma
   selección.
   ══════════════════════════════════════════════════════════════ */

export function Explorer() {
  const { t } = useLang();
  const apiRef = useRef<SceneApi | null>(null);

  return (
    <section id="explore" className="section-y container-x !pt-0" aria-labelledby="explore-title">
      <SectionHeader id="explore-title" eyebrow={t("explore.eyebrow")} title={t("explore.title")} lead={t("explore.lead")} />
      <div className="bezel">
        <div className="bezel-core stage">
          <div className="stage-main">
            <SceneShell className="stage-scene-box" apiRef={apiRef} />
          </div>
          <SceneToolbar apiRef={apiRef} className="stage-tools p-5" />
          <ProjectIndex className="stage-index px-5 py-3" />
          <ProjectPreview className="stage-info p-5 md:p-6" />
        </div>
      </div>
    </section>
  );
}
