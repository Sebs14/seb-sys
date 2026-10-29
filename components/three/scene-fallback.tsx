import { CORE } from "@/lib/scene-config";
import { carveRegions, fibonacciSphere, REGION_SEEDS } from "@/lib/dot-sphere";
import { clsx } from "@/lib/clsx";

/* ══════════════════════════════════════════════════════════════
   FALLBACK ESTÁTICO

   Sin WebGL (o mientras carga) el escenario no puede quedar vacío ni
   cambiar de altura. Este SVG dibuja la misma esfera de puntos, con la
   misma inclinación y las mismas siete regiones, proyectada de frente:
   sólo la cara visible, más tenue hacia los bordes. Es una imagen con
   nombre; la alternativa operable es el índice HTML de proyectos.
   ══════════════════════════════════════════════════════════════ */

const SIZE = 400;
const RADIUS = 150;

// Se calcula una vez: los puntos no dependen de nada en tiempo de render.
const DOTS = (() => {
  const { points, owner } = carveRegions(fibonacciSphere(640), REGION_SEEDS, CORE.gap);
  const [cx, sx] = [Math.cos(CORE.tiltX), Math.sin(CORE.tiltX)];
  const [cy, sy] = [Math.cos(CORE.tiltY), Math.sin(CORE.tiltY)];
  return points
    .map(([x, y, z], i) => {
      // Misma rotación que el grupo de la escena (Euler XYZ: primero Y, después X).
      const x1 = x * cy + z * sy;
      const z1 = -x * sy + z * cy;
      const y2 = y * cx - z1 * sx;
      const z2 = y * sx + z1 * cx;
      return { x: SIZE / 2 + x1 * RADIUS, y: SIZE / 2 - y2 * RADIUS, z: z2, owner: owner[i] };
    })
    .filter((d) => d.z > -0.15);
})();

export function SceneFallback({
  label,
  className,
  selectedIndex = 0,
}: {
  label: string;
  className?: string;
  selectedIndex?: number;
}) {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={label} className={clsx("h-full w-full", className)}>
      {DOTS.map((d, i) => {
        const selected = d.owner === selectedIndex;
        const facing = Math.max(0, Math.min(1, (d.z + 0.15) / 0.85));
        return (
          <circle
            key={i}
            cx={d.x.toFixed(1)}
            cy={d.y.toFixed(1)}
            r={selected ? 2.3 : 1.7}
            fill={selected ? "#5b8cff" : "#a1a1a8"}
            opacity={(0.18 + 0.82 * facing).toFixed(2)}
          />
        );
      })}
    </svg>
  );
}
