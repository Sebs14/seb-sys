import type { ReactNode } from "react";
import { clsx } from "@/lib/clsx";

/* ══════════════════════════════════════════════════════════════
   MARCOS DE CARACTERES

   El problema: un borde dibujado con glifos tiene que adaptarse a
   un ancho fluido, pero no podés "estirar" un caracter.

   La solución: una tira larga de ─ dentro de un contenedor con
   overflow:hidden. El navegador la recorta al ancho disponible, y
   como ─ y │ son glifos continuos, el corte a mitad de caracter es
   invisible. Bordes reales, layout fluido, cero CSS borders.
   ══════════════════════════════════════════════════════════════ */

/**
 * Sólo variantes cuyos glifos existen realmente en JetBrains Mono.
 * Verificado en navegador: las heavy (┏━┓┃) NO están en la fuente,
 * caen a un fallback con otro ancho de avance y parten la grilla.
 * Si alguna vez cambiamos de fuente, revalidar antes de agregarlas.
 */
const SETS = {
  single: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
  double: { tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║" },
  round: { tl: "╭", tr: "╮", bl: "╰", br: "╯", h: "─", v: "│" },
} as const;

export type FrameVariant = keyof typeof SETS;

/** Tiras pre-generadas: largas para cubrir cualquier viewport. */
const RUN = 320;
const hRun = (c: string) => c.repeat(RUN);
const vRun = (c: string) => Array.from({ length: 200 }, () => c).join("\n");

export function Frame({
  children,
  title,
  meta,
  variant = "single",
  tone = "dim",
  className,
  bodyClassName,
  glow = false,
}: {
  children: ReactNode;
  /** Texto embebido en el borde superior: ┌─ TÍTULO ────┐ */
  title?: string;
  /** Texto embebido a la derecha del borde superior. */
  meta?: string;
  variant?: FrameVariant;
  tone?: "dim" | "green" | "white";
  className?: string;
  bodyClassName?: string;
  glow?: boolean;
}) {
  const s = SETS[variant];

  const toneClass = {
    dim: "text-term-green-deep",
    green: "text-term-green",
    white: "text-term-gray",
  }[tone];

  return (
    <div className={clsx("relative", toneClass, glow && "glow", className)}>
      {/* ── borde superior ───────────────────────────────────── */}
      <div aria-hidden className="flex select-none whitespace-pre">
        <span>{s.tl}</span>
        <span>{s.h}</span>
        {title && (
          <span className="text-term-green">
            {" "}
            {title}{" "}
          </span>
        )}
        <span className="min-w-0 flex-1 overflow-hidden">{hRun(s.h)}</span>
        {meta && (
          <span className="text-term-gray">
            {" "}
            {meta}{" "}
          </span>
        )}
        <span>{s.h}</span>
        <span>{s.tr}</span>
      </div>

      {/* ── cuerpo con rieles laterales ──────────────────────── */}
      <div className="flex items-stretch">
        <Rail char={s.v} />
        <div className={clsx("min-w-0 flex-1 px-[2ch] py-[var(--lh)]", "text-term-white", bodyClassName)}>
          {children}
        </div>
        <Rail char={s.v} />
      </div>

      {/* ── borde inferior ───────────────────────────────────── */}
      <div aria-hidden className="flex select-none whitespace-pre">
        <span>{s.bl}</span>
        <span className="min-w-0 flex-1 overflow-hidden">{hRun(s.h)}</span>
        <span>{s.br}</span>
      </div>
    </div>
  );
}

/**
 * Columna vertical de glifos recortada al alto del contenedor.
 * La tira va en position:absolute a propósito: si estuviera en el
 * flujo, sus 200 líneas definirían la altura del marco en vez de
 * adaptarse a ella. Así el contenido manda y el riel se recorta.
 */
function Rail({ char }: { char: string }) {
  return (
    <div aria-hidden className="relative w-[1ch] shrink-0 overflow-hidden">
      <span className="absolute inset-0 select-none whitespace-pre leading-[var(--lh)]">
        {vRun(char)}
      </span>
    </div>
  );
}

/* ── separadores ───────────────────────────────────────────── */

export function Divider({
  char = "─",
  label,
  className,
}: {
  char?: string;
  label?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={clsx(
        "flex select-none whitespace-pre text-term-green-deep",
        className,
      )}
    >
      {label && <span className="text-term-green-dim">{label} </span>}
      <span className="min-w-0 flex-1 overflow-hidden">{char.repeat(RUN)}</span>
    </div>
  );
}

/** Barra de sombreado ░▒▓ usada como acento decorativo. */
export function Shade({
  className,
  reverse = false,
}: {
  className?: string;
  reverse?: boolean;
}) {
  const pattern = reverse ? "▓▒░" : "░▒▓";
  return (
    <span aria-hidden className={clsx("select-none whitespace-pre", className)}>
      {pattern}
    </span>
  );
}
