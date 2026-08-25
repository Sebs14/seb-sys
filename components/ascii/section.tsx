"use client";

import type { ReactNode } from "react";
import { Scramble } from "./text";
import { clsx } from "@/lib/clsx";

/* ══════════════════════════════════════════════════════════════
   ENCABEZADO DE SECCIÓN

   Mismo truco que los marcos: la tira de ─ se recorta al ancho
   disponible con overflow:hidden, así el encabezado cierra a
   cualquier viewport sin calcular nada. El título se decodifica
   al entrar en vista — el scroll es el disparador, no el montaje.
   ══════════════════════════════════════════════════════════════ */

const RUN = "─".repeat(320);

export function Section({
  id,
  index,
  title,
  meta,
  children,
  className,
}: {
  id: string;
  /** número de sección, se muestra como [02] */
  index: number;
  title: string;
  /** dato a la derecha del encabezado: un conteo, un año, una unidad */
  meta?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      // scroll-mt deja aire arriba al saltar desde la navegación.
      className={clsx("scroll-mt-[calc(var(--lh)*3)]", className)}
    >
      <header className="flex select-none items-baseline whitespace-pre text-term-green-deep">
        <span aria-hidden>{"── "}</span>
        <span className="text-term-green-dim">[{String(index).padStart(2, "0")}]</span>
        <span aria-hidden>{" "}</span>
        <h2 className="glow text-term-green">
          <Scramble text={title.toUpperCase()} step={22} />
        </h2>
        <span aria-hidden>{" "}</span>
        <span aria-hidden className="min-w-0 flex-1 overflow-hidden">
          {RUN}
        </span>
        {meta && (
          <>
            <span aria-hidden>{" "}</span>
            <span className="text-term-gray">{meta}</span>
            <span aria-hidden>{" ──"}</span>
          </>
        )}
      </header>

      <div className="pt-[var(--lh)]">{children}</div>
    </section>
  );
}
