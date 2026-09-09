/* ══════════════════════════════════════════════════════════════
   TIPOS DE LA ESCENA

   El contrato de estado del portafolio vive acá para que la escena
   Three, los controles HTML y la terminal hablen el mismo idioma sin
   importarse entre sí.
   ══════════════════════════════════════════════════════════════ */

/** Las tres presentaciones del mismo objeto. */
export type SceneMode = "core" | "systems" | "ascii";

export const SCENE_MODES: readonly SceneMode[] = ["core", "systems", "ascii"];

/** Ciclo de vida del canvas WebGL. */
export type SceneStatus =
  | "loading"
  | "ready"
  | "unsupported"
  | "recovering"
  | "failed";

export type QualityTier = "high" | "medium" | "low";

export type WebcamStatus =
  | "inactive"
  | "asking"
  | "live"
  | "denied"
  | "unsupported"
  | "error";

export type Phosphor = "green" | "amber";
