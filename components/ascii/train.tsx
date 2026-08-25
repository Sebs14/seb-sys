"use client";

import { useEffect, useRef, useState } from "react";
import { on } from "@/lib/bus";

/* ══════════════════════════════════════════════════════════════
   sl — LA LOCOMOTORA

   El chiste real de Unix, de los 80: te equivocás al escribir `ls`
   y en vez de un error te cruza un tren por la terminal. Acá cruza
   la página entera, en pasos de una celda como el gato y como el
   parallax: lo que se mueve respeta la grilla.

   Cruza una vez y se desmonta. No hay estado que limpiar después.
   ══════════════════════════════════════════════════════════════ */

const ENGINE = [
  String.raw`      ====        ________                ___________`,
  String.raw`  _D _|  |_______/        \__I_I_____===__|_________|`,
  String.raw`   |(_)---  |   H\________/ |   |        =|___ ___|  `,
  String.raw`   /     |  |   H  |  |     |   |         ||_| |_||  `,
  String.raw`  |      |  |   H  |__--------------------| [___] |  `,
  String.raw`  | ________|___H__/__|_____/[][]~\_______|       |  `,
  String.raw`  |/ |   |-----------I_____I [][] []  D   |=======|__`,
  String.raw`__/ =| o |=-~~\  /~~\  /~~\  /~~\ ____Y___________|__`,
  String.raw` |/-=|___|=O=====O=====O=====O   |_____/~\___/     `,
  String.raw`  \_/      \__/  \__/  \__/  \__/      \_/         `,
];

/** ancho del dibujo en celdas */
const TRAIN_COLS = 52;
const STEP_MS = 42;

export function Train() {
  const [running, setRunning] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLSpanElement>(null);

  useEffect(
    () =>
      on((e) => {
        if (e.type === "train") setRunning(true);
      }),
    [],
  );

  useEffect(() => {
    if (!running) return;
    const host = hostRef.current;
    const ruler = rulerRef.current;
    if (!host || !ruler) return;

    const cellW = ruler.getBoundingClientRect().width / 20;
    // Entra por la derecha y sale por la izquierda, como el sl original.
    let col = Math.ceil(window.innerWidth / cellW) + 2;
    const end = -TRAIN_COLS - 2;

    const paint = () => {
      host.style.transform = `translate3d(${col * cellW}px, 0, 0)`;
    };
    paint();

    const timer = setInterval(() => {
      col -= 1;
      if (col <= end) {
        clearInterval(timer);
        setRunning(false);
        return;
      }
      paint();
    }, STEP_MS);

    return () => clearInterval(timer);
  }, [running]);

  if (!running) return null;

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
        className="pointer-events-none fixed bottom-[calc(var(--lh)*2)] left-0 right-0 z-[70] select-none overflow-hidden"
      >
        <div
          ref={hostRef}
          className="glow w-max whitespace-pre leading-[var(--lh)] text-term-green will-change-transform"
        >
          {ENGINE.join("\n")}
        </div>
      </div>
    </>
  );
}
