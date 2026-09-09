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
  /** segmentos longitudinales de cada pieza */
  arcSegments: number;
  /** puntos del perfil (sección redondeada) */
  profilePoints: number;
  /** resolución del entorno PMREM */
  envResolution: number;
  /** ancho de celda ASCII en px CSS */
  asciiCell: number;
  /** partículas del cambio de modo (0 = ninguna) */
  particles: number;
  /** segmentos radiales de los tubos del grafo */
  edgeSegments: number;
};

export const SCENE_CONFIG: Record<QualityTier, SceneConfig> = {
  high: {
    dpr: 1.5,
    arcSegments: 64,
    profilePoints: 16,
    envResolution: 256,
    asciiCell: 7,
    particles: 0,
    edgeSegments: 8,
  },
  medium: {
    dpr: 1.25,
    arcSegments: 48,
    profilePoints: 12,
    envResolution: 128,
    asciiCell: 8,
    particles: 0,
    edgeSegments: 6,
  },
  low: {
    dpr: 1,
    arcSegments: 32,
    profilePoints: 10,
    envResolution: 64,
    asciiCell: 9,
    particles: 0,
    edgeSegments: 5,
  },
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

/** Geometría del núcleo (unidades de escena). */
export const CORE = {
  ringRadius: 1.35,
  gap: 0.045,
  ribbonWidth: 0.34,
  ribbonThickness: 0.12,
  axialWave: 0.16,
  tiltX: (24 * Math.PI) / 180,
  tiltY: (12 * Math.PI) / 180,
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
