import type { ReactNode } from "react";
import { clsx } from "@/lib/clsx";

/** Encabezado editorial: título grande, lead corto, alineado a la izquierda. */
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
      {eyebrow && <p className="t-meta mb-3 uppercase text-ink-3">{eyebrow}</p>}
      <h2 id={id} className="t-h2 text-ink">
        {title}
      </h2>
      {lead && <p className="t-lead measure mt-4 text-ink-2">{lead}</p>}
      {children}
    </div>
  );
}
