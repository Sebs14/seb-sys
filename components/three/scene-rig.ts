import type { Spring1D } from "@/lib/spring";

/* ══════════════════════════════════════════════════════════════
   RIG: el estado por cuadro de la escena

   Lo que cambia sesenta veces por segundo vive acá, en un objeto
   mutable compartido por refs entre los controles y las piezas. React
   no lo ve. Tiene un solo propósito: que las distintas partes de la
   escena hablen sin pasar por estado.
   ══════════════════════════════════════════════════════════════ */

export type Rig = {
  /** giro aplicado por el usuario (radianes) y su velocidad angular */
  spin: { x: number; y: number; vx: number; vy: number };
  /** pedido de volver a la vista inicial (los controles lo consumen) */
  resetRequested: boolean;
  /** progreso del scroll del hero, 0..1 (lo escribe el shell) */
  scroll: number;
  /** distancia de cámara con resorte */
  camera: Spring1D;
  /** 0 = metal, 1 = ASCII */
  ascii: Spring1D;
  /** 0 = anillo, 1 = grafo */
  spread: Spring1D;
  /** el usuario está arrastrando ahora */
  dragging: boolean;
  /** hubo interacción hace poco: la escena no debe dormirse aún */
  lastInteraction: number;
};

export function createRig(): Rig {
  return {
    spin: { x: 0, y: 0, vx: 0, vy: 0 },
    resetRequested: false,
    scroll: 0,
    camera: { value: 6, velocity: 0 },
    ascii: { value: 0, velocity: 0 },
    spread: { value: 0, velocity: 0 },
    dragging: false,
    lastInteraction: 0,
  };
}
