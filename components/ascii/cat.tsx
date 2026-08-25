"use client";

import { useEffect, useRef, useState } from "react";
import { on } from "@/lib/bus";

/* ══════════════════════════════════════════════════════════════
   EL GATO

   Camina por el borde inferior de la página, en pasos de UNA
   CELDA — la misma regla que el parallax: si la interfaz tiene
   una grilla, todo lo que se mueve la respeta. Cada tanto se
   duerme, y sigue.

   Aparece solo a los 40 segundos (la rareza es el punto) y se
   enciende o apaga con el comando `cat` de la terminal.
   ══════════════════════════════════════════════════════════════ */

/** Cuatro líneas en todos los cuadros: así el bloque no salta. */
const FRAMES = {
  walkA: ["", String.raw` /\_/\ `, "( o.o )", ` (")(")`],
  walkB: ["", String.raw` /\_/\ `, "( o.o )", `(") (")`],
  sleep: ["  z Z", String.raw` /\_/\ `, "( -.- )", ` (")(")`],
} as const;

type Mood = "walk" | "sleep";

/** Un glifo que el gato tiró de la página y va cayendo. */
type Falling = { id: number; x: number; y: number; char: string; rest: number };

/** Lo que un gato tira al suelo si lo dejás. */
const DEBRIS = "*·+°:.░▒";

const STEP_MS = 190;
/** ancho del dibujo, en celdas */
const CAT_COLS = 8;

export function Cat() {
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [falling, setFalling] = useState<Falling[]>([]);
  const seq = useRef(0);
  const hostRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLSpanElement>(null);

  // ── quién lo prende ──────────────────────────────────────────
  useEffect(() => {
    const off = on((e) => {
      if (e.type === "cat") setVisible(e.on);
      if (e.type === "terminal") setHidden(e.open);
    });
    // Aparición espontánea: nadie la pidió, y de eso se trata.
    const timer = setTimeout(() => setVisible(true), 40_000);
    return () => {
      off();
      clearTimeout(timer);
    };
  }, []);

  // ── caminata ─────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    const host = hostRef.current;
    const ruler = rulerRef.current;
    if (!host || !ruler) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cellW = ruler.getBoundingClientRect().width / 20;
    const cellH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--lh"),
      ) || 21;

    let col = 0;
    let dir: 1 | -1 = 1;
    let mood: Mood = reduced ? "sleep" : "walk";
    let tick = 0;
    let restUntil = 0;

    const paint = (key: keyof typeof FRAMES) => {
      host.textContent = FRAMES[key].join("\n");
    };

    // Sin animación el gato existe pero se queda dormido en su sitio.
    if (reduced) {
      paint("sleep");
      host.style.transform = `translate3d(${4 * cellW}px, 0, 0)`;
      return;
    }

    const maxCol = () => Math.floor(window.innerWidth / cellW) - CAT_COLS;

    const timer = setInterval(() => {
      // En segundo plano no hay a quién mostrarle el gato.
      if (document.hidden) return;
      tick += 1;

      // ── los glifos que tiró, cayendo ──────────────────────
      setFalling((prev) =>
        prev
          .map((p) =>
            p.y > 0
              ? { ...p, y: p.y - cellH }
              : { ...p, y: 0, rest: p.rest - 1 },
          )
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

      /* Cada tanto manotea algo y lo tira: es lo que hace un gato con
         cualquier objeto sobre una superficie. Acá el objeto es un
         glifo, y cae de fila en fila como todo lo demás. */
      if (Math.random() < 0.02) {
        seq.current += 1;
        const id = seq.current;
        const char = DEBRIS[Math.floor(Math.random() * DEBRIS.length)];
        setFalling((prev) =>
          // Tope de 6: un gato desordena, no hace una avalancha.
          [...prev.slice(-5), { id, x: (col + 3) * cellW, y: cellH * 6, char, rest: 14 }],
        );
      }

      // Una siesta cada tanto, de 2 a 6 segundos.
      if (Math.random() < 0.012) {
        mood = "sleep";
        restUntil = tick + 10 + Math.floor(Math.random() * 22);
      }

      paint(tick % 2 ? "walkA" : "walkB");
      host.style.transform = `translate3d(${col * cellW}px, 0, 0)`;
      // Al ir a la izquierda el dibujo se espeja: un gato no camina de reversa.
      host.style.scale = dir === 1 ? "1 1" : "-1 1";
    }, STEP_MS);

    return () => clearInterval(timer);
  }, [visible]);

  if (!visible) return null;

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
        className={
          hidden
            ? "hidden"
            : "pointer-events-none fixed bottom-0 left-0 right-0 z-[60] select-none"
        }
      >
        <div
          ref={hostRef}
          className="glow w-max whitespace-pre leading-[var(--lh)] text-term-green will-change-transform"
        >
          {FRAMES.walkA.join("\n")}
        </div>

        {falling.map((p) => (
          <span
            key={p.id}
            className="absolute select-none text-term-green-dim"
            style={{ left: p.x, bottom: p.y }}
          >
            {p.char}
          </span>
        ))}
      </div>
    </>
  );
}
