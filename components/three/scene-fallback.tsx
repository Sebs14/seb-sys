import { CORE } from "@/lib/scene-config";
import { clsx } from "@/lib/clsx";

/* ══════════════════════════════════════════════════════════════
   FALLBACK ESTÁTICO

   Sin WebGL (o mientras carga) el hero no puede quedar vacío ni
   cambiar de altura. Este SVG dibuja el mismo anillo de siete piezas
   con degradados que insinúan el aluminio. Es una imagen con nombre;
   la alternativa operable es la lista HTML de proyectos que está al
   lado, no este dibujo.
   ══════════════════════════════════════════════════════════════ */

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

export function SceneFallback({
  label,
  className,
  selectedIndex = 0,
}: {
  label: string;
  className?: string;
  selectedIndex?: number;
}) {
  const step = (Math.PI * 2) / CORE.pieces;
  const gap = 0.07;
  const cx = 200;
  const cy = 200;
  const r = 128;

  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label={label}
      className={clsx("h-full w-full", className)}
      style={{ transform: "rotateX(24deg) rotate(12deg)", transformOrigin: "50% 50%" }}
    >
      <defs>
        <linearGradient id="alu" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2f4f6" />
          <stop offset="0.35" stopColor="#b9c0c7" />
          <stop offset="0.6" stopColor="#6d757d" />
          <stop offset="1" stopColor="#d8dde2" />
        </linearGradient>
        <linearGradient id="alu-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a3036" />
          <stop offset="1" stopColor="#0f1215" />
        </linearGradient>
      </defs>
      {Array.from({ length: CORE.pieces }, (_, i) => {
        const a0 = i * step - Math.PI / 2 + gap / 2;
        const a1 = (i + 1) * step - Math.PI / 2 - gap / 2;
        return (
          <g key={i}>
            <path d={arcPath(cx, cy + 6, r, a0, a1)} stroke="url(#alu-edge)" strokeWidth={34} fill="none" strokeLinecap="butt" />
            <path d={arcPath(cx, cy, r, a0, a1)} stroke="url(#alu)" strokeWidth={34} fill="none" strokeLinecap="butt" />
            {i === selectedIndex && (
              <path
                d={arcPath(cx, cy, r + 13, a0 + 0.04, a0 + 0.16)}
                stroke="#54df86"
                strokeWidth={4}
                fill="none"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
