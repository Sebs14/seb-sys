"use client";

import { useEffect, useRef, useState } from "react";

/* ══════════════════════════════════════════════════════════════
   RIEL DE PROGRESO

   La barra de scroll del navegador, redibujada con caracteres: el
   riel es una columna de │ y el pulgar un bloque █ que salta de
   fila en fila. Abajo el porcentaje en números, porque un adorno
   que además informa vale más que uno que solo decora.

   No reemplaza al scrollbar nativo (sigue ahí, estilizado en
   globals.css): esto es la lectura de posición, visible sólo
   donde hay margen para ponerla.
   ══════════════════════════════════════════════════════════════ */

const ROWS = 14;

export function ScrollRail() {
  const [pct, setPct] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const read = () => {
      raf.current = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setPct(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const schedule = () => {
      if (!raf.current) raf.current = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const thumb = Math.round(pct * (ROWS - 1));

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-[1ch] top-1/2 z-40 hidden -translate-y-1/2 select-none text-center leading-[var(--lh)] xl:block"
    >
      {Array.from({ length: ROWS }, (_, i) => (
        <div
          key={i}
          className={i === thumb ? "glow text-term-green" : "text-term-green-deep"}
        >
          {i === thumb ? "█" : "│"}
        </div>
      ))}
      <div className="pt-[calc(var(--lh)/2)] text-term-gray tabular-nums">
        {String(Math.round(pct * 100)).padStart(3, " ")}
      </div>
    </div>
  );
}
