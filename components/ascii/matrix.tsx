"use client";

import { useEffect, useRef, useState } from "react";
import { on } from "@/lib/bus";

/* ══════════════════════════════════════════════════════════════
   LLUVIA DE GLIFOS

   Dura tres segundos y se desmonta. Dos capas de texto: las
   cabezas brillantes y las colas apagadas. Con una sola capa no
   se puede colorear por caracter sin meter un span por celda —
   y mil spans por cuadro es exactamente lo que este sitio evita.
   ══════════════════════════════════════════════════════════════ */

const GLYPHS = "01アイウエオカキクケコサシスセソ<>[]{}/\\|=+*#%@$&";
const MS = 3000;

export function Matrix() {
  const [on_, setOn] = useState(false);
  const headRef = useRef<HTMLPreElement>(null);
  const tailRef = useRef<HTMLPreElement>(null);

  useEffect(
    () =>
      on((e) => {
        if (e.type !== "matrix") return;
        // Con movimiento reducido el comando simplemente no hace nada:
        // mejor ignorarlo acá que montar y desmontar en el mismo tick.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        setOn(true);
      }),
    [],
  );

  useEffect(() => {
    if (!on_) return;

    const head = headRef.current;
    const tail = tailRef.current;
    if (!head || !tail) return;

    const cellW = 8.4;
    const cellH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--lh"),
      ) || 21;
    const cols = Math.ceil(window.innerWidth / cellW);
    const rows = Math.ceil(window.innerHeight / cellH);

    const drops = Array.from({ length: cols }, () => ({
      y: Math.random() * -rows,
      speed: 0.4 + Math.random() * 1.1,
    }));
    const pick = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

    const draw = () => {
      const headGrid: string[][] = [];
      const tailGrid: string[][] = [];
      for (let r = 0; r < rows; r += 1) {
        headGrid.push(new Array(cols).fill(" "));
        tailGrid.push(new Array(cols).fill(" "));
      }

      drops.forEach((drop, c) => {
        drop.y += drop.speed;
        if (drop.y - 8 > rows) {
          drop.y = -Math.random() * 12;
          drop.speed = 0.4 + Math.random() * 1.1;
        }
        const h = Math.floor(drop.y);
        if (h >= 0 && h < rows) headGrid[h][c] = pick();
        for (let k = 1; k < 9; k += 1) {
          const r = h - k;
          if (r >= 0 && r < rows) tailGrid[r][c] = pick();
        }
      });

      head.textContent = headGrid.map((r) => r.join("")).join("\n");
      tail.textContent = tailGrid.map((r) => r.join("")).join("\n");
    };

    const timer = setInterval(draw, 70);
    const stop = setTimeout(() => setOn(false), MS);
    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [on_]);

  if (!on_) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90] select-none overflow-hidden"
    >
      <pre
        ref={tailRef}
        className="absolute inset-0 m-0 leading-[var(--lh)] text-term-green-deep"
      />
      <pre
        ref={headRef}
        className="glow-strong absolute inset-0 m-0 leading-[var(--lh)] text-term-white"
      />
    </div>
  );
}
