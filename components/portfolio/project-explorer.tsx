"use client";

import { usePortfolio } from "./portfolio-state";
import { useLang } from "@/lib/i18n";
import { projects } from "@/lib/content";
import { connectionsOf } from "@/lib/project-graph";
import { emit } from "@/lib/bus";
import { clsx } from "@/lib/clsx";

/* ══════════════════════════════════════════════════════════════
   EXPLORADOR: la alternativa HTML de la escena

   Siete botones, uno por pieza, con aria-pressed. Es el camino de
   teclado y sin WebGL, y es la misma selección que la escultura: una
   sola fuente de verdad. Pasar el puntero sólo resalta; no cambia la
   selección hecha con teclado.
   ══════════════════════════════════════════════════════════════ */

export function ProjectChips({ className }: { className?: string }) {
  const { t } = useLang();
  const { selectedId, select, setHovered } = usePortfolio();
  return (
    <div role="group" aria-label={t("scene.pickProject")} className={clsx("flex flex-wrap gap-2", className)}>
      {projects.map((p, i) => (
        <button
          key={p.id}
          type="button"
          aria-pressed={selectedId === p.id}
          onClick={() => select(p.id)}
          onPointerEnter={() => setHovered(p.id)}
          onPointerLeave={() => setHovered(null)}
          onFocus={() => setHovered(p.id)}
          onBlur={() => setHovered(null)}
          className="btn btn-secondary btn-sm !px-3.5"
          aria-label={`${p.name} — ${t("scene.pieceOf", { n: i + 1, total: projects.length })}`}
        >
          <span aria-hidden className="chip-index">
            {String(i + 1).padStart(2, "0")}
          </span>
          {p.name}
        </button>
      ))}
    </div>
  );
}

export function ProjectPreview({ className }: { className?: string }) {
  const { t, b } = useLang();
  const { selectedId, openProject, graph } = usePortfolio();
  const project = projects.find((p) => p.id === selectedId) ?? projects[0];
  const index = projects.indexOf(project);
  const connections = connectionsOf(graph, project.id);

  return (
    <div className={clsx("panel min-h-[13.5rem] p-5 md:p-6", className)} aria-live="polite" aria-atomic="true">
      <p className="t-meta uppercase text-ink-3">
        {t("scene.selected")} · {t("scene.pieceOf", { n: index + 1, total: projects.length })}
      </p>
      <h2 className="t-h3 mt-2 text-ink">{project.name}</h2>
      <p className="t-small mt-1 text-ink-3">
        {b(project.org)} · {project.year}
      </p>
      <p className="t-body mt-3 text-ink-2">{b(project.tagline)}</p>

      <p className="t-small mt-3 text-ink-3">
        {connections.length ? (
          <>
            {t("scene.sharesWith")}{" "}
            {connections.map((c, i) => (
              <span key={c.id}>
                <span className="text-ink-2">{c.name}</span>{" "}
                <span className="t-meta">({c.sharedTags.join(", ")})</span>
                {i < connections.length - 1 ? " · " : ""}
              </span>
            ))}
          </>
        ) : (
          t("scene.noConnections")
        )}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => openProject(project.id)}>
          {t("scene.viewProject")}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => emit({ type: "print-project", id: project.id })}
        >
          {t("scene.readInTerminal")}
        </button>
      </div>
    </div>
  );
}
