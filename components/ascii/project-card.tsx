"use client";

import { useEffect, useId, useState } from "react";
import { Frame } from "./frame";
import { GlitchText } from "./text";
import { useLang } from "@/lib/i18n";
import { on } from "@/lib/bus";
import { clsx } from "@/lib/clsx";
import type { Project } from "@/lib/content";

/* ══════════════════════════════════════════════════════════════
   CARD DE PROYECTO

   Se abre en el lugar, no navega ni abre modal: en una grilla de
   caracteres, mover al usuario de página rompe la ilusión de que
   está frente a un solo aparato. Al abrirse el marco pasa de
   simple a doble y prende el glow — el estado se lee en el borde,
   no en un icono.

   El diagrama `flow` es el detalle que importa: la card no solo
   se ve, también dice cómo está hecho el sistema.
   ══════════════════════════════════════════════════════════════ */

export function ProjectCard({ project }: { project: Project }) {
  const { b, t } = useLang();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  // `open <n>` en la terminal abre la card sin tocarla con el mouse.
  useEffect(
    () =>
      on((e) => {
        if (e.type === "open-project" && e.id === project.id) setOpen(true);
      }),
    [project.id],
  );

  return (
    <Frame
      variant={open ? "double" : "single"}
      tone={open ? "green" : "dim"}
      glow={open}
      className={clsx(
        "transition-colors duration-200",
        project.featured && "md:col-span-2",
      )}
      bodyClassName="py-0!"
    >
      {/* ── cabecera clickeable ──────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex w-full cursor-pointer items-baseline gap-[1ch] py-[var(--lh)] text-left"
      >
        <span aria-hidden className="select-none text-term-green">
          {open ? "▾" : "▸"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-term-white group-hover:glow-strong group-hover:text-term-green">
            <GlitchText text={project.name} />
          </span>
          <span className="block text-term-green-dim">{b(project.tagline)}</span>
        </span>
        <span className="shrink-0 select-none text-term-gray tabular-nums">
          {project.year}
        </span>
      </button>

      {/* ── panel ────────────────────────────────────────────── */}
      <div
        id={panelId}
        hidden={!open}
        className="border-t border-term-line pb-[var(--lh)] pt-[var(--lh)]"
      >
        <p className="text-term-gray">
          <span className="text-term-green-dim">{b(project.org)}</span>
        </p>

        {project.flow && (
          <p
            aria-hidden
            className="mt-[var(--lh)] overflow-x-auto whitespace-pre text-term-green"
          >
            {project.flow}
          </p>
        )}

        <p className="mt-[var(--lh)] text-term-white">{b(project.description)}</p>

        {project.highlights && (
          <ul className="mt-[var(--lh)] space-y-[calc(var(--lh)/2)]">
            {project.highlights.map((h, i) => (
              <li key={i} className="flex gap-[1ch] text-term-gray">
                <span aria-hidden className="shrink-0 select-none text-term-green-deep">
                  ├─
                </span>
                <span className="min-w-0">{b(h)}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-[var(--lh)] flex flex-wrap gap-x-[1ch] text-term-green-dim">
          {project.tags.map((tag) => (
            <span key={tag} className="whitespace-nowrap">
              [{tag}]
            </span>
          ))}
        </p>

        {(project.live || project.source) && (
          <p className="mt-[var(--lh)] flex gap-[3ch]">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer noopener"
                className="text-term-green hover:glow-strong"
              >
                {"▸ "}
                {t("ui.live")}
              </a>
            )}
            {project.source && (
              <a
                href={project.source}
                target="_blank"
                rel="noreferrer noopener"
                className="text-term-green hover:glow-strong"
              >
                {"▸ "}
                {t("ui.source")}
              </a>
            )}
          </p>
        )}
      </div>
    </Frame>
  );
}
