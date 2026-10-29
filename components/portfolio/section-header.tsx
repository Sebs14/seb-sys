import type { ReactNode } from "react";
import { clsx } from "@/lib/clsx";

/** Encabezado editorial: título grande, lead corto, alineado a la izquierda.
    El antetítulo lleva la misma marca que el índice con regla. */
export function SectionHeader({
  id,
  eyebrow,
  title,
  lead,
  className,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={clsx("mb-10 md:mb-14", className)}>
      {eyebrow && (
        <p className="t-ui mb-4 flex items-center gap-3 text-ink-3">
          <span aria-hidden className="h-px w-6 bg-accent" />
          {eyebrow}
        </p>
      )}
      <h2 id={id} className="t-h2 text-ink">
        {title}
      </h2>
      {lead && <p className="t-lead measure mt-4 text-ink-2">{lead}</p>}
      {children}
    </div>
  );
}
