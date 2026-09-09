"use client";

import { useLang } from "@/lib/i18n";
import type { Project } from "@/lib/content";
import { FlowDiagram } from "./flow-diagram";

/* Cuerpo de detalle de un proyecto: lo comparten los casos destacados
   y la lista. Todo sale de `lib/content.ts`. */
export function ProjectDetail({ project, showDescription = true }: { project: Project; showDescription?: boolean }) {
  const { b, t } = useLang();
  return (
    <div className="space-y-6">
      {showDescription && <p className="t-body measure text-ink-2">{b(project.description)}</p>}

      {project.flow && (
        <div>
          <p className="t-meta mb-3 uppercase text-ink-3">{t("work.flow")}</p>
          <FlowDiagram flow={project.flow} />
        </div>
      )}

      {project.highlights && project.highlights.length > 0 && (
        <div>
          <p className="t-meta mb-3 uppercase text-ink-3">{t("work.highlights")}</p>
          <ul className="space-y-3">
            {project.highlights.map((h, i) => (
              <li key={i} className="t-small flex gap-3 text-ink-2">
                <span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span className="measure">{b(h)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {project.tags.map((tag) => (
          <span key={tag} className="chip">
            {tag}
          </span>
        ))}
      </div>

      {(project.live || project.source) && (
        <div className="flex flex-wrap gap-3">
          {project.live && (
            <a href={project.live} target="_blank" rel="noreferrer noopener" className="btn btn-secondary btn-sm">
              {t("work.live")}
            </a>
          )}
          {project.source && (
            <a href={project.source} target="_blank" rel="noreferrer noopener" className="btn btn-secondary btn-sm">
              {t("work.source")}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
