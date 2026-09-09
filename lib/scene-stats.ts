import type { QualityTier, SceneMode, SceneStatus } from "./scene-types";

/* ══════════════════════════════════════════════════════════════
   MEDICIONES REALES DE LA ESCENA

   `htop` no inventa números: la escena escribe acá lo que de verdad
   dibujó y la terminal lo lee. Es un objeto mutable a propósito —
   se actualiza en cada cuadro y React no tiene por qué enterarse.
   ══════════════════════════════════════════════════════════════ */

export type SceneStats = {
  /** cuadros que la escena renderizó de verdad (no rAF de la página) */
  frames: number;
  /** marca de tiempo del último cuadro renderizado */
  lastFrameAt: number;
  drawCalls: number;
  triangles: number;
  dpr: number;
  quality: QualityTier | null;
  mode: SceneMode | null;
  status: SceneStatus | null;
  frameloop: "always" | "demand" | "never" | null;
  /** columnas × filas del pase ASCII; null si no aplica */
  asciiCells: { cols: number; rows: number } | null;
  textures: number;
  geometries: number;
  /** quién pidió cuadros (diagnóstico): piezas, controles, ascii, cámara */
  invalidations: { pieces: number; controls: number; ascii: number; blend: number };
};

export const sceneStats: SceneStats = {
  frames: 0,
  lastFrameAt: 0,
  drawCalls: 0,
  triangles: 0,
  dpr: 0,
  quality: null,
  mode: null,
  status: null,
  frameloop: null,
  asciiCells: null,
  textures: 0,
  geometries: 0,
  invalidations: { pieces: 0, controls: 0, ascii: 0, blend: 0 },
};

/**
 * Cuenta cuadros efectivamente renderizados por la escena durante una
 * ventana. Si el canvas está a demanda y quieto, el resultado es 0 — y
 * eso es correcto: no está dibujando.
 */
export function sampleSceneFps(ms = 600): Promise<number | null> {
  return new Promise((resolve) => {
    if (sceneStats.status === null) {
      resolve(null);
      return;
    }
    const start = sceneStats.frames;
    setTimeout(() => {
      resolve(Math.round(((sceneStats.frames - start) * 1000) / ms));
    }, ms);
  });
}

/* Gancho de diagnóstico: `window.__sebStats` deja leer las mediciones
   desde DevTools y desde las pruebas E2E sin tocar la interfaz. */
declare global {
  interface Window {
    __sebStats?: SceneStats;
  }
}
if (typeof window !== "undefined") window.__sebStats = sceneStats;
