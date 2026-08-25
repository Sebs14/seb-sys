"use client";

import { useEffect, useRef, useState } from "react";

/* ══════════════════════════════════════════════════════════════
   SALVAPANTALLAS

   Un minuto sin tocar nada y el monitor se aburre: el cartel rebota
   por la pantalla como el logo del DVD. En pasos de celda, igual que
   todo lo que se mueve acá.

   Cualquier señal de vida lo saca. Mientras está puesto, el
   temporizador va a 2 cuadros por segundo: no hace falta más para
   algo que se mira de reojo, y no calienta la máquina.
   ══════════════════════════════════════════════════════════════ */

const IDLE_MS = 60_000;
const STEP_MS = 500;

const SIGN = [
  "┌────────────────┐",
  "│    SEB.SYS     │",
  "│  ░▒▓ idle ▓▒░  │",
  "└────────────────┘",
];
const SIGN_COLS = 18;
const SIGN_ROWS = SIGN.length;

export function Screensaver() {
  const [idle, setIdle] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLSpanElement>(null);

  // ── detección de inactividad ─────────────────────────────────
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = window.setTimeout(() => setIdle(true), IDLE_MS);
    const wake = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), IDLE_MS);
    };

    const events = ["pointermove", "pointerdown", "keydown", "scroll", "wheel"];
    events.forEach((name) =>
      window.addEventListener(name, wake, { passive: true }),
    );
    return () => {
      window.clearTimeout(timer);
      events.forEach((name) => window.removeEventListener(name, wake));
    };
  }, []);

  // ── rebote ───────────────────────────────────────────────────
  useEffect(() => {
    if (!idle) return;
    const host = hostRef.current;
    const ruler = rulerRef.current;
    if (!host || !ruler) return;

    const cellW = ruler.getBoundingClientRect().width / 20;
    const cellH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--lh"),
      ) || 21;

    const maxCol = () => Math.floor(window.innerWidth / cellW) - SIGN_COLS;
    const maxRow = () => Math.floor(window.innerHeight / cellH) - SIGN_ROWS;

    let col = Math.floor(maxCol() / 2);
    let row = Math.floor(maxRow() / 2);
    let dc = 1;
    let dr = 1;

    const paint = () => {
      host.style.transform = `translate3d(${col * cellW}px, ${row * cellH}px, 0)`;
    };
    paint();

    const timer = window.setInterval(() => {
      col += dc;
      row += dr;
      if (col <= 0 || col >= maxCol()) dc = -dc as 1 | -1;
      if (row <= 0 || row >= maxRow()) dr = -dr as 1 | -1;
      col = Math.max(0, Math.min(maxCol(), col));
      row = Math.max(0, Math.min(maxRow(), row));
      paint();
    }, STEP_MS);

    return () => window.clearInterval(timer);
  }, [idle]);

  if (!idle) return null;

  return (
    <>
      <span
        ref={rulerRef}
        aria-hidden
        className="pointer-events-none invisible fixed left-0 top-0 whitespace-pre"
      >
        00000000000000000000
      </span>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[96] select-none bg-term-bg/92"
      >
        <div
          ref={hostRef}
          className="glow absolute left-0 top-0 w-max whitespace-pre leading-[var(--lh)] text-term-green will-change-transform"
        >
          {SIGN.join("\n")}
        </div>
      </div>
    </>
  );
}
