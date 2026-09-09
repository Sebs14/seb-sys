"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import { caseStudies, projects, type CaseStudy, type Project } from "@/lib/content";
import { on } from "@/lib/bus";
import { clsx } from "@/lib/clsx";
import { FlowDiagram } from "./flow-diagram";
import { ProjectDetail } from "./project-detail";
import { SectionHeader } from "./section-header";

/* ══════════════════════════════════════════════════════════════
   CASOS DESTACADOS

   Dos bloques editoriales de ancho completo con composición alternada:
   texto (contexto, decisión, evidencia) y un esquema del sistema en
   SVG/HTML con etiquetas reales. El detalle completo se abre en el
   mismo flujo con un disclosure accesible.
   ══════════════════════════════════════════════════════════════ */

function SystemSchematic({ study, project, flip }: { study: CaseStudy; project: Project; flip: boolean }) {
  const { b, t } = useLang();
  const stages = study.stages.map(b);
  const n = stages.length;
  const w = 560;
  const h = 300;
  const padX = 34;
  const gapX = (w - padX * 2) / (n - 1);
  // Alternancia vertical: la fila superior son procesos, la inferior almacenamiento/espera.
  const yFor = (i: number) => (i % 2 === 0 ? 96 : 190);

  return (
    <figure className={clsx("panel-soft overflow-hidden p-5 md:p-7", flip && "lg:order-first")}>
      <figcaption className="t-meta mb-4 flex items-center justify-between uppercase text-ink-3">
        <span>{t("work.diagram")}</span>
        <span>{project.year}</span>
      </figcaption>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label={`${t("work.diagram")}: ${stages.join(" → ")}`}>
        <defs>
          <marker id={`arrow-${project.id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M0 0L10 5 0 10z" fill="#8f99a3" />
          </marker>
          <linearGradient id={`plate-${project.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#262b30" />
            <stop offset="1" stopColor="#15191c" />
          </linearGradient>
        </defs>
        {/* riel de referencia */}
        <line x1={padX} y1={h - 40} x2={w - padX} y2={h - 40} stroke="#303840" strokeDasharray="2 6" />
        {stages.map((label, i) => {
          const x = padX + i * gapX;
          const y = yFor(i);
          const next = i < n - 1 ? { x: padX + (i + 1) * gapX, y: yFor(i + 1) } : null;
          return (
            <g key={label + i}>
              {next && (
                <path
                  d={`M ${x + 34} ${y} C ${x + gapX / 2} ${y}, ${x + gapX / 2} ${next.y}, ${next.x - 36} ${next.y}`}
                  fill="none"
                  stroke="#8f99a3"
                  strokeWidth="1.5"
                  markerEnd={`url(#arrow-${project.id})`}
                />
              )}
              <circle cx={x} cy={y} r="30" fill={`url(#plate-${project.id})`} stroke={i === 3 ? "#9ef5b5" : "#3a434c"} strokeWidth={i === 3 ? 1.5 : 1} />
              <circle cx={x} cy={y} r="8" fill={i === 3 ? "#9ef5b5" : "#b8bec5"} />
              <text x={x} y={y + 54} textAnchor="middle" fill="#f5f6f7" fontSize="14" fontFamily="var(--font-mono)">
                {label}
              </text>
              <text x={x} y={h - 20} textAnchor="middle" fill="#8f99a3" fontSize="11" fontFamily="var(--font-mono)">
                {String(i + 1).padStart(2, "0")}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

function CaseBlock({ study, index }: { study: CaseStudy; index: number }) {
  const { b, t } = useLang();
  const project = projects.find((p) => p.id === study.projectId);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(
    () =>
      on((e) => {
        if (e.type === "open-project" && project && e.id === project.id) {
          setOpen(true);
          // Enfocar el encabezado del detalle y traerlo a la vista.
          requestAnimationFrame(() => {
            headingRef.current?.focus({ preventScroll: true });
            headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }
      }),
    [project],
  );

  if (!project) return null;
  const flip = index % 2 === 1;

  return (
    <article id={`project-${project.id}`} className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14" aria-labelledby={`case-${project.id}`}>
      <div className={clsx(flip && "lg:order-last")}>
        <p className="t-meta uppercase text-ink-3">
          {b(project.org)} · {project.year}
        </p>
        <h3 id={`case-${project.id}`} ref={headingRef} tabIndex={-1} className="t-h3 mt-3 text-ink outline-none">
          {project.name}
        </h3>
        <p className="t-lead mt-2 text-ink-2">{b(project.tagline)}</p>

        <dl className="mt-8 space-y-6">
          <div>
            <dt className="t-meta uppercase text-ink-3">{t("work.context")}</dt>
            <dd className="t-body measure mt-2 text-ink-2">{b(study.problem)}</dd>
          </div>
          <div>
            <dt className="t-meta uppercase text-ink-3">{t("work.decision")}</dt>
            <dd className="t-body measure mt-2 text-ink">{b(study.decision)}</dd>
          </div>
          {study.evidence.length > 0 && (
            <div>
              <dt className="t-meta uppercase text-ink-3">{t("work.evidence")}</dt>
              <dd className="mt-2">
                <ul className="space-y-2">
                  {study.evidence.map((e, i) => (
                    <li key={i} className={clsx("measure flex gap-3 text-ink-2", i === 0 ? "t-lead text-ink" : "t-small")}>
                      <span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{b(e)}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
          <div>
            <dt className="t-meta uppercase text-ink-3">{t("work.tech")}</dt>
            <dd className="mt-3 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          className="btn btn-secondary btn-sm btn-toggle mt-8"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? t("work.hideDetail") : t("work.detail")}
        </button>
        <div id={panelId} className="disclosure" data-open={open}>
          <div>
            <div className="pt-8">
              <ProjectDetail project={project} />
            </div>
          </div>
        </div>
      </div>

      <div className={clsx("lg:sticky lg:top-28", flip && "lg:order-first")}>
        <SystemSchematic study={study} project={project} flip={flip} />
        <div className="mt-4">
          <FlowDiagram labels={study.stages.map(b)} />
        </div>
      </div>
    </article>
  );
}

export function FeaturedCases() {
  const { t } = useLang();
  return (
    <section id="work" className="section-y container-x" aria-labelledby="work-title">
      <SectionHeader id="work-title" eyebrow={t("nav.work")} title={t("work.featured")} lead={t("work.featuredLead")} />
      <div className="space-y-24 md:space-y-32">
        {caseStudies.map((study, i) => (
          <CaseBlock key={study.projectId} study={study} index={i} />
        ))}
      </div>
    </section>
  );
}
