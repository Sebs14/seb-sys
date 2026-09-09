"use client";

import { useEffect, useRef } from "react";
import { motionIsStill } from "@/lib/use-motion-preference";

/* Salvapantallas: el cartel rebota como el logo del DVD. Ya no se
   activa solo por inactividad: lo pide el comando `screensaver`, y
   cualquier señal de vida lo saca. */

const STEP_MS = 500;
const SIGN = ["┌────────────────┐", "│    SEB.SYS     │", "│  ░▒▓ idle ▓▒░  │", "└────────────────┘"];
const SIGN_COLS = 18;
const SIGN_ROWS = SIGN.length;

export function Screensaver({ onDone, closeLabel }: { onDone: () => void; closeLabel: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const ruler = rulerRef.current;
    if (!host || !ruler) return;
    const cellW = ruler.getBoundingClientRect().width / 20;
    const cellH = 21;
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

    // Se arma un instante después: el Enter del comando no debe apagarlo.
    const arm = window.setTimeout(() => {
      const events = ["pointerdown", "keydown", "wheel", "touchstart"];
      events.forEach((name) => window.addEventListener(name, onDone, { passive: true }));
      cleanupWake = () => events.forEach((name) => window.removeEventListener(name, onDone));
    }, 400);
    let cleanupWake = () => {};

    const timer = motionIsStill()
      ? null
      : window.setInterval(() => {
          col += dc;
          row += dr;
          if (col <= 0 || col >= maxCol()) dc = -dc;
          if (row <= 0 || row >= maxRow()) dr = -dr;
          col = Math.max(0, Math.min(maxCol(), col));
          row = Math.max(0, Math.min(maxRow(), row));
          paint();
        }, STEP_MS);

    return () => {
      window.clearTimeout(arm);
      cleanupWake();
      if (timer) window.clearInterval(timer);
    };
  }, [onDone]);

  return (
    <>
      <span ref={rulerRef} aria-hidden className="pointer-events-none invisible fixed left-0 top-0 whitespace-pre font-mono">
        00000000000000000000
      </span>
      <div className="fixed inset-0 z-[96] select-none bg-base/95" aria-hidden>
        <div ref={hostRef} className="absolute left-0 top-0 w-max whitespace-pre font-mono text-[14px] leading-[21px] text-phosphor will-change-transform">
          {SIGN.join("\n")}
        </div>
      </div>
      <button type="button" onClick={onDone} className="btn btn-secondary btn-sm fixed right-4 top-4 z-[97]">
        {closeLabel}
      </button>
    </>
  );
}
