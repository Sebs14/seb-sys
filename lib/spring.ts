/* ══════════════════════════════════════════════════════════════
   RESORTES

   Integración semi-implícita de un resorte amortiguado. Se aplica a
   valores que viven en refs y se mutan en el bucle de render: sin
   asignaciones nuevas por cuadro. `damping` cerca de crítico
   (2·√(k·m)) para que el objeto asiente sin rebotar de más.
   ══════════════════════════════════════════════════════════════ */

export type SpringConfig = { stiffness: number; damping: number; mass: number };

export const PANEL_SPRING: SpringConfig = { stiffness: 170, damping: 26, mass: 1 };
/** Piezas de la escena: más pesado, asienta en ~700 ms. */
export const PIECE_SPRING: SpringConfig = { stiffness: 92, damping: 18.5, mass: 1 };
/** Cámara: sin sobreimpulso perceptible. */
export const CAMERA_SPRING: SpringConfig = { stiffness: 70, damping: 17, mass: 1 };

export type Spring1D = { value: number; velocity: number };

/** Un paso; devuelve true si sigue en movimiento. */
export function stepSpring(s: Spring1D, target: number, dt: number, c: SpringConfig): boolean {
  // Limitar dt evita saltos al volver de una pestaña oculta.
  const h = Math.min(dt, 1 / 30);
  const force = -c.stiffness * (s.value - target) - c.damping * s.velocity;
  s.velocity += (force / c.mass) * h;
  s.value += s.velocity * h;
  const moving = Math.abs(s.velocity) > 1e-4 || Math.abs(s.value - target) > 1e-4;
  if (!moving) {
    s.value = target;
    s.velocity = 0;
  }
  return moving;
}

/** Suavizado exponencial (amortiguamiento crítico sin velocidad). */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * Math.min(dt, 1 / 30)));
}
