"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { clsx } from "@/lib/clsx";

/**
 * Barra de nivel dibujada con bloques. Se llena al entrar en vista.
 * El valor numérico se expone al lector de pantalla; los bloques no.
 */
export function LevelBar({
  label,
  level,
  width = 18,
  className,
}: {
  label: string;
  /** 0–100 */
  level: number;
  /** ancho en caracteres */
  width?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const [filled, setFilled] = useState(0);

  const target = Math.round((Math.min(100, Math.max(0, level)) / 100) * width);

  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      setFilled(current);
      if (current >= target) clearInterval(timer);
    }, 38);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <div
      ref={ref}
      className={clsx(
        "flex items-baseline gap-[1ch] overflow-hidden whitespace-pre",
        className,
      )}
    >
      <span className="w-[10ch] shrink-0 truncate text-term-white">{label}</span>
      <span aria-hidden className="glow shrink-0 select-none text-term-green">
        {"█".repeat(filled)}
        <span className="text-term-green-deep">{"░".repeat(width - filled)}</span>
      </span>
      <span className="shrink-0 text-term-gray tabular-nums">
        {String(level).padStart(3, " ")}
      </span>
      <span className="sr-only">
        {label}: {level} / 100
      </span>
    </div>
  );
}
