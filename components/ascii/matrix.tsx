"use client";

import { useEffect, useRef } from "react";
import { motionIsStill } from "@/lib/use-motion-preference";

/* Lluvia de glifos: tres segundos y se desmonta. Dos capas de texto
   (cabezas y colas) sin un span por celda. Con movimiento reducido
   pinta un solo cuadro estático y se va igual. Botón de salida visible. */

const GLYPHS = "01アイウエオカキクケコサシスセソ<>[]{}/\\|=+*#%@$&";
const MS = 3000;

export function Matrix({ onDone, closeLabel }: { onDone: () => void; closeLabel: string }) {
  const headRef = useRef<HTMLPreElement>(null);
  const tailRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const head = headRef.current;
    const tail = tailRef.current;
    if (!head || !tail) return;

    const cellW = 8.4;
    const cellH = 21;
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

    if (motionIsStill()) {
      for (let i = 0; i < 20; i += 1) draw();
      const stop = setTimeout(onDone, MS);
      return () => clearTimeout(stop);
    }

    const timer = setInterval(draw, 70);
    const stop = setTimeout(onDone, MS);
    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[90] select-none overflow-hidden">
      <pre ref={tailRef} aria-hidden className="pointer-events-none absolute inset-0 m-0 font-mono text-[14px] leading-[21px] text-phosphor-deep" />
      <pre ref={headRef} aria-hidden className="pointer-events-none absolute inset-0 m-0 font-mono text-[14px] leading-[21px] text-ink" />
      <button type="button" onClick={onDone} className="btn btn-secondary btn-sm glass absolute right-4 top-4">
        {closeLabel}
      </button>
    </div>
  );
}
