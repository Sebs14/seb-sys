import { describe, expect, it } from "vitest";
import { carveRegions, facingSpin, fibonacciSphere, nearestSeed, REGION_SEEDS } from "@/lib/dot-sphere";

describe("esfera de puntos", () => {
  it("los puntos de Fibonacci están sobre la esfera unidad", () => {
    for (const p of fibonacciSphere(500)) {
      expect(Math.hypot(...p)).toBeCloseTo(1, 6);
    }
  });

  it("hay siete regiones y todas reciben puntos parecidos", () => {
    expect(REGION_SEEDS).toHaveLength(7);
    const { owner } = carveRegions(fibonacciSphere(1800), REGION_SEEDS, 0.085);
    const counts = Array.from({ length: 7 }, (_, i) => owner.filter((o) => o === i).length);
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    expect(min).toBeGreaterThan(150);
    // Ninguna región es el doble que otra: las piezas se leen como pares.
    expect(max / min).toBeLessThan(2);
  });

  it("cada punto conservado pertenece a su semilla más cercana", () => {
    const { points, owner } = carveRegions(fibonacciSphere(900), REGION_SEEDS, 0.05);
    points.forEach((p, i) => expect(nearestSeed(p, REGION_SEEDS)).toBe(owner[i]));
  });

  it("la junta entre regiones quita puntos, y sin junta no se quita ninguno", () => {
    const all = fibonacciSphere(1800);
    expect(carveRegions(all, REGION_SEEDS, 0).points).toHaveLength(all.length);
    const carved = carveRegions(all, REGION_SEEDS, 0.085).points.length;
    expect(carved).toBeLessThan(all.length * 0.92);
    expect(carved).toBeGreaterThan(all.length * 0.65);
  });
});

describe("vista de frente", () => {
  it("el giro calculado lleva la región a mirar a la cámara", () => {
    const tilt = { x: 0.4, y: 0.2 };
    for (const seed of REGION_SEEDS) {
      const spin = facingSpin(seed, tilt, Math.PI);
      const ax = tilt.x + spin.x;
      const ay = tilt.y + spin.y;
      // Euler XYZ: v' = Rx(ax) · Ry(ay) · v
      const [x, y, z] = seed;
      const x1 = x * Math.cos(ay) + z * Math.sin(ay);
      const z1 = -x * Math.sin(ay) + z * Math.cos(ay);
      const y2 = y * Math.cos(ax) - z1 * Math.sin(ax);
      const z2 = y * Math.sin(ax) + z1 * Math.cos(ax);
      expect(x1).toBeCloseTo(0, 6);
      expect(y2).toBeCloseTo(0, 6);
      expect(z2).toBeCloseTo(1, 6);
    }
  });
});
