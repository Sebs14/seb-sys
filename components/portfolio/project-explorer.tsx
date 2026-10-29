"use client";

import { usePortfolio } from "./portfolio-state";
import { useLang } from "@/lib/i18n";
import { projects } from "@/lib/content";
import { connectionsOf } from "@/lib/project-graph";
import { emit } from "@/lib/bus";
import { clsx } from "@/lib/clsx";

/* ══════════════════════════════════════════════════════════════
   EXPLORADOR: la alternativa HTML de la escena

   Siete botones, uno por pieza, con aria-pressed, dibujados como una
   regla: la marca del elegido se alarga. Es el camino de teclado y sin
   WebGL, y es la misma selección que la escultura: una sola fuente de
   verdad. Pasar el puntero sólo resalta; no cambia la selección hecha
   con teclado.
   ══════════════════════════════════════════════════════════════ */

export function ProjectIndex({ className }: { className?: string }) {
  const { t } = useLang();
  const { selectedId, select, setHovered } = usePortfolio();
  return (
    <div className={className}>
      <div role="group" aria-label={t("scene.pickProject")} className="ruler">
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
            className="ruler-item"
            aria-label={`${p.name} — ${t("scene.pieceOf", { n: i + 1, total: projects.length })}`}
          >
            <span aria-hidden className="chip-index">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="truncate">{p.name}</span>
          </button>
        ))}
      </div>
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
    <div
      className={clsx("grid content-start gap-x-10 gap-y-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto]", className)}
      aria-live="polite"
      aria-atomic="true"
    >
      <div>
        <p className="t-meta uppercase text-ink-3">
          {t("scene.selected")} · {t("scene.pieceOf", { n: index + 1, total: projects.length })}
        </p>
        <h3 className="t-h3 mt-3 text-ink">{project.name}</h3>
        <p className="t-small mt-1 text-ink-3">
          {b(project.org)} · {project.year}
        </p>
        <p className="t-small mt-2 text-ink-2">{b(project.tagline)}</p>
      </div>

      <p className="t-small text-ink-3 md:pt-7">
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

      <div className="flex flex-wrap gap-2 md:col-span-2 lg:col-span-1 lg:flex-col lg:items-stretch lg:pt-7">
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
