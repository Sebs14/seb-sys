import type { QualityTier } from "./scene-types";

/* ══════════════════════════════════════════════════════════════
   PRESUPUESTO POR NIVEL DE CALIDAD

   Un solo lugar para los números que cambian con la GPU. La escena
   los lee por tier y el monitor de rendimiento cambia de tier con
   histéresis y un máximo de cambios por sesión: nada de oscilar el DPR
   cada segundo.
   ══════════════════════════════════════════════════════════════ */

export type SceneConfig = {
  /** tope de devicePixelRatio */
  dpr: number;
  /** puntos de la esfera antes de abrir las juntas */
  dots: number;
  /** puntos por arista del grafo */
  edgeDots: number;
  /** ancho de celda ASCII en px CSS */
  asciiCell: number;
};

export const SCENE_CONFIG: Record<QualityTier, SceneConfig> = {
  high: { dpr: 1.75, dots: 2200, edgeDots: 26, asciiCell: 7 },
  medium: { dpr: 1.5, dots: 1600, edgeDots: 20, asciiCell: 8 },
  low: { dpr: 1.25, dots: 1100, edgeDots: 14, asciiCell: 9 },
};

/** Tier inicial: móvil o pantalla táctil chica arranca en `low`. */
export function initialTier(): QualityTier {
  if (typeof window === "undefined") return "high";
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const small = window.innerWidth < 768;
  if (coarse && small) return "low";
  if (coarse || small) return "medium";
  return "high";
}

/** Geometría de la esfera (unidades de escena). */
export const CORE = {
  radius: 1.35,
  /** diferencia de coseno que abre la junta entre regiones */
  gap: 0.085,
  /** radio de cada cúmulo en el modo Sistemas */
  clusterRadius: 0.24,
  /** tamaño del punto, en unidades de escena */
  dotSize: 0.021,
  tiltX: (24 * Math.PI) / 180,
  tiltY: (12 * Math.PI) / 180,
  /** inclinación máxima que el visitante puede sumar arrastrando */
  maxTilt: 0.55,
  pieces: 7,
} as const;

export const CAMERA = {
  fov: 34,
  position: [0, 0, 6] as [number, number, number],
} as const;

/** Duraciones de movimiento, en ms. */
export const TIMING = {
  entrance: 800,
  modeTransition: 700,
  asciiBlend: 420,
  settle: 4000,
} as const;
