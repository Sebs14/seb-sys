"use client";

import { useEffect, useRef, useState } from "react";
import { on } from "@/lib/bus";
import { motionIsStill, onMotionChange } from "@/lib/use-motion-preference";

/* ══════════════════════════════════════════════════════════════
   EL GATO

   Camina por el borde inferior en pasos de una celda mono. Aparece
   sólo cuando alguien lo pide (`cat` en la terminal o el laboratorio)
   y se guarda con `nocat`. Con movimiento reducido existe pero duerme.
   ══════════════════════════════════════════════════════════════ */

const FRAMES = {
  walkA: ["", String.raw` /\_/\ `, "( o.o )", ` (")(")`],
  walkB: ["", String.raw` /\_/\ `, "( o.o )", `(") (")`],
  sleep: ["  z Z", String.raw` /\_/\ `, "( -.- )", ` (")(")`],
} as const;

type Mood = "walk" | "sleep";
type Falling = { id: number; x: number; y: number; char: string; rest: number };
const DEBRIS = "*·+°:.░▒";
const STEP_MS = 190;
const CAT_COLS = 8;

export function Cat() {
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [falling, setFalling] = useState<Falling[]>([]);
  const seq = useRef(0);
  const hostRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLSpanElement>(null);

  useEffect(
    () =>
      on((e) => {
        if (e.type === "cat") setVisible(e.on);
        if (e.type === "terminal") setHidden(e.open);
      }),
    [],
  );

  useEffect(() => {
    if (!visible) return;
    const host = hostRef.current;
    const ruler = rulerRef.current;
    if (!host || !ruler) return;

    const cellW = ruler.getBoundingClientRect().width / 20;
    const cellH = 21;
    let col = 2;
    let dir: 1 | -1 = 1;
    let mood: Mood = "walk";
    let tick = 0;
    let restUntil = 0;
    let timer: ReturnType<typeof setInterval> | null = null;

    const paint = (key: keyof typeof FRAMES) => {
      host.textContent = FRAMES[key].join("\n");
    };
    const maxCol = () => Math.floor(window.innerWidth / cellW) - CAT_COLS;

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
      paint("sleep");
    };

    const start = () => {
      if (timer) return;
      timer = setInterval(() => {
        if (document.hidden) return;
        tick += 1;
        setFalling((prev) =>
          prev
            .map((p) => (p.y > 0 ? { ...p, y: p.y - cellH } : { ...p, y: 0, rest: p.rest - 1 }))
            .filter((p) => p.rest > 0),
        );
        if (mood === "sleep") {
          if (tick >= restUntil) mood = "walk";
          paint("sleep");
          return;
        }
        col += dir;
        if (col <= 0) {
          col = 0;
          dir = 1;
        } else if (col >= maxCol()) {
          col = maxCol();
          dir = -1;
        }
        if (Math.random() < 0.02) {
          seq.current += 1;
          const char = DEBRIS[Math.floor(Math.random() * DEBRIS.length)];
          setFalling((prev) => [
            ...prev.slice(-5),
            { id: seq.current, x: (col + 3) * cellW, y: cellH * 6, char, rest: 14 },
          ]);
        }
        if (Math.random() < 0.012) {
          mood = "sleep";
          restUntil = tick + 10 + Math.floor(Math.random() * 22);
        }
        paint(tick % 2 ? "walkA" : "walkB");
        host.style.transform = `translate3d(${col * cellW}px, 0, 0)`;
        host.style.scale = dir === 1 ? "1 1" : "-1 1";
      }, STEP_MS);
    };

    const sync = () => {
      if (motionIsStill()) stop();
      else start();
    };
    host.style.transform = `translate3d(${col * cellW}px, 0, 0)`;
    sync();
    const off = onMotionChange(sync);
    return () => {
      off();
      if (timer) clearInterval(timer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <span ref={rulerRef} aria-hidden className="pointer-events-none invisible fixed left-0 top-0 whitespace-pre font-mono">
        00000000000000000000
      </span>
      <div
        aria-hidden
        className={hidden ? "hidden" : "pointer-events-none fixed bottom-0 left-0 right-0 z-[60] select-none"}
      >
        <div ref={hostRef} className="w-max whitespace-pre font-mono text-[14px] leading-[21px] text-phosphor will-change-transform">
          {FRAMES.walkA.join("\n")}
        </div>
        {falling.map((p) => (
          <span key={p.id} className="absolute select-none font-mono text-phosphor-dim" style={{ left: p.x, bottom: p.y }}>
            {p.char}
          </span>
        ))}
      </div>
    </>
  );
}
