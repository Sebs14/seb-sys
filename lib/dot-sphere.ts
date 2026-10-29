/* ══════════════════════════════════════════════════════════════
   ESFERA DE PUNTOS — geometría pura

   La escultura es una esfera de puntos dividida en siete regiones, una
   por proyecto. Los puntos salen de una espiral de Fibonacci (casi
   equidistantes, sin polos amontonados); cada uno pertenece a la
   semilla más cercana, y los que caen sobre la frontera entre dos
   regiones se quitan: esa franja vacía es la junta entre piezas.

   Sin three ni DOM: lo usan la escena, el respaldo SVG y las pruebas.
   ══════════════════════════════════════════════════════════════ */

export type Vec3 = [number, number, number];

/** Puntos casi equidistantes sobre la esfera unidad. */
export function fibonacciSphere(n: number): Vec3[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const points: Vec3[] = [];
  for (let i = 0; i < n; i += 1) {
    const y = 1 - ((i + 0.5) / n) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    points.push([Math.cos(t) * r, y, Math.sin(t) * r]);
  }
  return points;
}

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Índice de la semilla más cercana a una dirección (unitaria). */
export function nearestSeed(direction: Vec3, seeds: readonly Vec3[]): number {
  let best = 0;
  let bestDot = -Infinity;
  seeds.forEach((s, i) => {
    const d = dot(direction, s);
    if (d > bestDot) {
      bestDot = d;
      best = i;
    }
  });
  return best;
}

export type Carved = { points: Vec3[]; owner: number[] };

/**
 * Reparte los puntos entre las semillas y quita los de la frontera.
 * `gap` es la diferencia mínima de coseno entre la semilla más cercana
 * y la segunda: con ~0.05 falta una fila de puntos; con ~0.085, dos.
 */
export function carveRegions(points: readonly Vec3[], seeds: readonly Vec3[], gap: number): Carved {
  const kept: Vec3[] = [];
  const owner: number[] = [];
  for (const p of points) {
    let best = -Infinity;
    let second = -Infinity;
    let index = 0;
    seeds.forEach((s, i) => {
      const d = dot(p, s);
      if (d > best) {
        second = best;
        best = d;
        index = i;
      } else if (d > second) {
        second = d;
      }
    });
    if (best - second < gap) continue;
    kept.push(p);
    owner.push(index);
  }
  return { points: kept, owner };
}

/** Pseudoaleatorio con semilla: la esfera sale igual en cada visita. */
export function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Dirección unitaria al azar (para los cúmulos del modo Sistemas). */
export function randomDirection(rand: () => number): Vec3 {
  const z = rand() * 2 - 1;
  const t = rand() * Math.PI * 2;
  const r = Math.sqrt(1 - z * z);
  return [Math.cos(t) * r, Math.sin(t) * r, z];
}

/** Centros de las siete regiones, uno por proyecto. */
export const REGION_SEEDS: readonly Vec3[] = fibonacciSphere(7);

/**
 * Giro (x, y) que pone una dirección de frente a la cámara, con la
 * rotación Euler XYZ del grupo (primero Y, después X) y su inclinación
 * base descontada. `x` queda acotado a ±maxTilt.
 */
export function facingSpin(direction: Vec3, tilt: { x: number; y: number }, maxTilt: number) {
  const [x, y, z] = direction;
  const turnY = Math.atan2(-x, z);
  const turnX = Math.atan2(y, Math.hypot(x, z));
  return {
    x: Math.max(-maxTilt, Math.min(maxTilt, turnX - tilt.x)),
    y: turnY - tilt.y,
  };
}

