"use client";

import { useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════════
   PARALLAX EN ESPACIO DE CARACTERES

   Un parallax normal desplaza capas en píxeles y queda suave. Acá
   eso estaría mal: en una grilla monoespaciada nada vive a mitad
   de celda. Así que el desplazamiento se CUANTIZA — cada capa
   avanza de fila en fila y de columna en columna, nunca entre
   medio. Se siente como un terminal haciendo scroll, no como una
   web con efecto.

   Tres capas con velocidad distinta dan la profundidad; el puntero
   las corre de a columnas para que además responda al mouse.

   Implementación: texto plano en el DOM, no canvas. Tres nodos de
   texto y un transform por capa — el compositor hace el resto, y
   los glifos usan exactamente la misma fuente que el resto del
   sitio (un canvas obliga a re-resolver la fuente y se nota).
   ══════════════════════════════════════════════════════════════ */

type Layer = {
  /** semilla del generador: fija, para que el cielo no cambie en cada render */
  seed: number;
  /** proporción de celdas con glifo (0-1) */
  density: number;
  /** de qué glifos se dibuja. Sólo caracteres que EXISTEN en JetBrains
      Mono: uno que caiga a fallback trae otro ancho de avance y parte
      la grilla — el mismo cuidado que en frame.tsx. */
  glyphs: string;
  /** fracción del scroll que recorre. Más chico = más lejos. */
  speed: number;
  /** columnas que se corre con el puntero de borde a borde */
  tilt: number;
  className: string;
};

const LAYERS: Layer[] = [
  { seed: 1337, density: 0.012, glyphs: ".", speed: 0.06, tilt: 1, className: "text-term-green-deep opacity-40" },
  { seed: 4242, density: 0.008, glyphs: ".·:", speed: 0.16, tilt: 2, className: "text-term-green-deep opacity-70" },
  { seed: 9001, density: 0.004, glyphs: "·+*°", speed: 0.34, tilt: 4, className: "text-term-green-dim opacity-50" },
];

/** Generador congruencial: determinista y suficiente para ruido visual. */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Un bloque de texto de `rows` líneas × `cols` columnas, casi todo vacío. */
function field(layer: Layer, cols: number, rows: number): string {
  const rand = lcg(layer.seed);
  const lines: string[] = [];
  for (let r = 0; r < rows; r += 1) {
    let line = "";
    for (let c = 0; c < cols; c += 1) {
      line +=
        rand() < layer.density
          ? layer.glyphs[Math.floor(rand() * layer.glyphs.length)]
          : " ";
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export function Starfield() {
  const hostRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const ruler = rulerRef.current;
    if (!host || !ruler) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let cellW = 8;
    let cellH = 21;
    let blobRows = 0;
    /** desplazamientos ya aplicados, para no escribir el style si no cambió */
    let applied: string[] = [];
    let pointerX = 0;
    let raf = 0;

    const nodes = Array.from(host.children) as HTMLDivElement[];

    // ── medición: la celda sale del ancho real de 20 glifos ──────
    const measure = () => {
      cellW = ruler.getBoundingClientRect().width / 20;
      cellH =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--lh"),
        ) || 21;

      const cols = Math.ceil(window.innerWidth / cellW) + 10;
      const rows = Math.ceil(window.innerHeight / cellH) + 2;
      // El bloque se dibuja dos veces, apilado: así el módulo del
      // desplazamiento cicla sin costura y el cielo es infinito.
      blobRows = rows;

      nodes.forEach((node, i) => {
        const blob = field(LAYERS[i], cols, blobRows);
        node.textContent = blob + "\n" + blob;
      });
      applied = [];
    };

    // ── desplazamiento cuantizado ────────────────────────────────
    const paint = () => {
      raf = 0;
      const y = window.scrollY;
      const px = pointerX;

      nodes.forEach((node, i) => {
        const layer = LAYERS[i];

        // Filas enteras, nunca medias filas: acá vive el efecto.
        const rowsMoved = Math.round((y * layer.speed) / cellH);
        const wrapped = ((rowsMoved % blobRows) + blobRows) % blobRows;
        const colsMoved = Math.round(px * layer.tilt);

        const next = `translate3d(${(colsMoved - 5) * cellW}px, ${-wrapped * cellH}px, 0)`;
        if (applied[i] !== next) {
          node.style.transform = next;
          applied[i] = next;
        }
      });
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };

    const onPointer = (e: PointerEvent) => {
      // −1 … 1 según la mitad de pantalla en la que está el puntero.
      pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      schedule();
    };

    measure();
    paint();

    if (!reduced.matches) {
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("pointermove", onPointer, { passive: true });
    }

    // El remedido regenera los bloques: barato y evita huecos al rotar.
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        measure();
        paint();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Regla de medición: 20 glifos reales, fuera de vista. */}
      <span
        ref={rulerRef}
        aria-hidden
        className="pointer-events-none invisible fixed left-0 top-0 whitespace-pre"
      >
        00000000000000000000
      </span>

      <div
        ref={hostRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 select-none overflow-hidden"
      >
        {LAYERS.map((layer) => (
          <div
            key={layer.seed}
            className={`absolute left-0 top-0 whitespace-pre leading-[var(--lh)] will-change-transform ${layer.className}`}
          />
        ))}
      </div>
    </>
  );
}
