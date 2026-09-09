"use client";

import { useLang } from "@/lib/i18n";
import { experience } from "@/lib/content";
import { SectionHeader } from "./section-header";

/* Trayectoria en una columna editorial. En móvil la fecha va sobre el
   texto; nada de una columna fija que estrangule el contenido. Los
   puestos sin contribuciones se muestran tal cual: no se rellenan. */
export function Experience() {
  const { b, t } = useLang();
  return (
    <section id="experience" className="section-y container-x" aria-labelledby="experience-title">
      <SectionHeader id="experience-title" eyebrow={t("nav.experience")} title={t("experience.title")} />
      <ol className="border-t border-stroke">
        {experience.map((job) => {
          const range =
            job.to === job.from ? job.from : `${job.from} — ${job.to ?? t("experience.present")}`;
          return (
            <li key={job.company + job.from} className="grid gap-x-10 gap-y-2 border-b border-stroke py-7 md:grid-cols-[11rem_minmax(0,1fr)] md:py-9">
              <p className="t-meta text-ink-3">{range}</p>
              <div className="min-w-0">
                <h3 className="t-h3 text-ink">{job.company}</h3>
                <p className="t-body mt-1 text-ink-2">{b(job.role)}</p>
                {job.bullets.length > 0 && (
                  <ul className="mt-5 space-y-3">
                    {job.bullets.map((bullet, i) => (
                      <li key={i} className="t-small measure flex gap-3 text-ink-2">
                        <span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        <span>{b(bullet)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
