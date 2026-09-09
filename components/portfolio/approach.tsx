"use client";

import { useMemo } from "react";
import { useLang } from "@/lib/i18n";
import { about, facts, projects, stack } from "@/lib/content";
import { buildExpertise, OTHER_GROUP } from "@/lib/expertise";
import { usePortfolio } from "./portfolio-state";
import { SectionHeader } from "./section-header";

/* ══════════════════════════════════════════════════════════════
   ENFOQUE Y STACK

   Los tres párrafos de `about` con ritmo editorial y la ficha como
   lista de definición. El stack se presenta con evidencia: cada
   tecnología dice en qué proyectos aparece (lib/expertise), nunca un
   porcentaje.
   ══════════════════════════════════════════════════════════════ */

export function Approach() {
  const { b, t } = useLang();
  const { openProject } = usePortfolio();
  const groups = useMemo(() => buildExpertise(projects, stack), []);
  const nameOf = (id: string) => projects.find((p) => p.id === id)?.name ?? id;
  const other = groups.find((g) => g.label === OTHER_GROUP);
  const count = (n: number) => (n === 1 ? t("stack.projectsOne") : t("stack.projectsMany", { n }));

  return (
    <section id="about" className="section-y bg-section" aria-labelledby="about-title">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-20">
          <div>
            <SectionHeader id="about-title" eyebrow={t("nav.about")} title={t("about.title")} className="mb-8" />
            <div className="space-y-6">
              {about.paragraphs.map((p, i) => (
                <p key={i} className={i === 0 ? "t-lead measure text-ink" : "t-body measure text-ink-2"}>
                  {b(p)}
                </p>
              ))}
            </div>
          </div>

          <aside className="panel self-start p-6" aria-label={t("about.facts")}>
            <p className="t-meta mb-4 uppercase text-ink-3">{t("about.facts")}</p>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3">
              {facts.map((fact) => (
                <div key={fact.label.en} className="contents">
                  <dt className="t-small text-ink-3">{b(fact.label)}</dt>
                  <dd className="t-small text-ink">{b(fact.value)}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <div id="stack" className="mt-24 md:mt-32">
          <SectionHeader title={t("stack.title")} lead={t("stack.lead")} className="mb-8" />
          <div className="grid gap-10 md:grid-cols-3">
            {groups.filter((g) => g !== other).map((group) => (
              <div key={group.label.en}>
                <h3 className="t-meta mb-4 uppercase text-ink-3">{b(group.label)}</h3>
                <ul className="space-y-4">
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="t-body font-medium text-ink">{item.name}</span>
                        <span className="t-meta shrink-0 text-ink-3">{count(item.projectIds.length)}</span>
                      </div>
                      <ul className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
                        {item.projectIds.map((id) => (
                          <li key={id}>
                            <button
                              type="button"
                              onClick={() => openProject(id)}
                              className="link t-small !min-h-0 rounded py-1 text-ink-2"
                            >
                              {nameOf(id)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {other && (
            <div className="mt-12 border-t border-stroke pt-8">
              <h3 className="t-meta mb-4 uppercase text-ink-3">{b(other.label)}</h3>
              <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                {other.items.map((item) => (
                  <li key={item.name} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="t-small font-medium text-ink">{item.name}</span>
                    <span className="t-small text-ink-3">
                      {item.projectIds.map((id, i) => (
                        <span key={id}>
                          <button
                            type="button"
                            onClick={() => openProject(id)}
                            className="link !min-h-0 rounded text-ink-2"
                          >
                            {nameOf(id)}
                          </button>
                          {i < item.projectIds.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
