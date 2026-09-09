"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import { projects, type Project } from "@/lib/content";
import { on } from "@/lib/bus";
import { clsx } from "@/lib/clsx";
import { ProjectDetail } from "./project-detail";
import { SectionHeader } from "./section-header";

/* ══════════════════════════════════════════════════════════════
   RESTO DE PROYECTOS

   Lista editorial de cinco entradas. Cada una se expande en el lugar
   con un disclosure real (aria-expanded/aria-controls, id estable). El
   disparador queda visible y el estado sobrevive al cambio de idioma
   porque vive en el componente, no en el texto.
   ══════════════════════════════════════════════════════════════ */

function Row({ project, index }: { project: Project; index: number }) {
  const { b, t } = useLang();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(
    () =>
      on((e) => {
        if (e.type === "open-project" && e.id === project.id) {
          setOpen(true);
          requestAnimationFrame(() => {
            headingRef.current?.focus({ preventScroll: true });
            headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }
      }),
    [project.id],
  );

  return (
    <li id={`project-${project.id}`} className="hairline">
      <div className="grid gap-x-8 gap-y-3 py-6 md:grid-cols-[6rem_minmax(0,1fr)_auto] md:items-baseline md:py-8">
        <p className="t-meta text-ink-3">
          {String(index + 1).padStart(2, "0")} · {project.year}
        </p>
        <div className="min-w-0">
          <h3 ref={headingRef} tabIndex={-1} className="t-h3 text-ink outline-none">
            {project.name}
          </h3>
          <p className="t-body mt-1 text-ink-2">{b(project.tagline)}</p>
          <p className="t-small mt-1 text-ink-3">{b(project.org)}</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm btn-toggle justify-self-start md:justify-self-end"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span>{open ? t("work.close") : t("work.open")}</span>
          <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={clsx("transition-transform duration-200", open && "rotate-180")}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      <div id={panelId} className="disclosure" data-open={open}>
        <div>
          <div className="pb-8 md:pl-[8rem]">
            <ProjectDetail project={project} />
          </div>
        </div>
      </div>
    </li>
  );
}

export function ProjectList() {
  const { t } = useLang();
  const rest = projects.filter((p) => !p.featured);
  return (
    <section className="section-y container-x !pt-0" aria-labelledby="more-title">
      <SectionHeader id="more-title" title={t("work.more")} />
      <ul className="border-b border-stroke">
        {rest.map((p, i) => (
          <Row key={p.id} project={p} index={i + projects.filter((x) => x.featured).length} />
        ))}
      </ul>
    </section>
  );
}
