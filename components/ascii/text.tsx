"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { clsx } from "@/lib/clsx";

/* ══════════════════════════════════════════════════════════════
   EFECTOS DE TEXTO

   Regla de accesibilidad que aplica a todo este archivo: el texto
   animado va con aria-hidden y el texto final completo se expone
   en un nodo sr-only. Un lector de pantalla nunca escucha la sopa
   de glifos intermedia.
   ══════════════════════════════════════════════════════════════ */

const NOISE = "!<>-_\\/[]{}—=+*^?#░▒▓█@$%&";
const randChar = () => NOISE[Math.floor(Math.random() * NOISE.length)];

/* ── cursor ───────────────────────────────────────────────────── */

export function Cursor({
  char = "█",
  className,
}: {
  char?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={clsx("inline-block animate-blink text-term-green", className)}
    >
      {char}
    </span>
  );
}

/* ── máquina de escribir ──────────────────────────────────────── */

export function Typewriter({
  text,
  speed = 28,
  delay = 0,
  className,
  cursor = true,
  onDone,
  start = true,
}: {
  text: string;
  /** ms por caracter */
  speed?: number;
  /** ms antes de empezar */
  delay?: number;
  className?: string;
  cursor?: boolean;
  onDone?: () => void;
  start?: boolean;
}) {
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!start) return;
    doneRef.current = false;
    setCount(0);

    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;

    const begin = () => {
      let i = 0;
      const tick = () => {
        i += 1;
        setCount(i);
        if (i < text.length) {
          timer = setTimeout(tick, speed);
        } else if (!doneRef.current) {
          doneRef.current = true;
          onDone?.();
        }
      };
      timer = setTimeout(tick, speed);
    };

    timer = setTimeout(begin, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
    // onDone se omite a propósito: cambiarlo no debe reiniciar el tipeo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, delay, start]);

  const shown = text.slice(0, count);
  const done = count >= text.length;

  return (
    <span className={className}>
      <span aria-hidden className="whitespace-pre-wrap">
        {shown}
      </span>
      {cursor && !done && <Cursor char="▮" />}
      <span className="sr-only">{text}</span>
    </span>
  );
}

/* ── decodificador (scramble) ─────────────────────────────────── */

export function Scramble({
  text,
  className,
  /** ms entre revelar un caracter y el siguiente */
  step = 34,
  /** dispara al entrar en viewport en vez de al montar */
  onView = true,
  delay = 0,
}: {
  text: string;
  className?: string;
  step?: number;
  onView?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [display, setDisplay] = useState(text);
  const active = onView ? inView : true;

  useEffect(() => {
    if (!active) {
      // Antes de entrar en vista mostramos ruido, no el texto final.
      setDisplay(text.replace(/\S/g, () => randChar()));
      return;
    }

    let revealed = 0;
    let timer: ReturnType<typeof setTimeout>;
    let frame: ReturnType<typeof setInterval>;

    const run = () => {
      // Los caracteres aún no revelados siguen girando.
      frame = setInterval(() => {
        setDisplay(
          text
            .split("")
            .map((c, i) => {
              if (i < revealed || c === " ") return c;
              return randChar();
            })
            .join(""),
        );
      }, 40);

      timer = setInterval(() => {
        revealed += 1;
        if (revealed > text.length) {
          clearInterval(timer);
          clearInterval(frame);
          setDisplay(text);
        }
      }, step);
    };

    const kickoff = setTimeout(run, delay);
    return () => {
      clearTimeout(kickoff);
      clearInterval(timer);
      clearInterval(frame);
    };
  }, [active, text, step, delay]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden className="whitespace-pre-wrap">
        {display}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

/* ── glitch en hover ──────────────────────────────────────────── */

export function GlitchText({
  text,
  className,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  as?: "span" | "div";
}) {
  const [display, setDisplay] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setDisplay(text);
  };

  const startGlitch = () => {
    if (intervalRef.current) return;
    let ticks = 0;
    intervalRef.current = setInterval(() => {
      ticks += 1;
      setDisplay(
        text
          .split("")
          .map((c) => (c !== " " && Math.random() < 0.28 ? randChar() : c))
          .join(""),
      );
      if (ticks > 8) stop();
    }, 45);
  };

  useEffect(() => stop, [text]);

  return (
    <Tag
      className={className}
      onMouseEnter={startGlitch}
      onFocus={startGlitch}
      onMouseLeave={stop}
      onBlur={stop}
    >
      <span aria-hidden className="whitespace-pre">
        {display}
      </span>
      <span className="sr-only">{text}</span>
    </Tag>
  );
}
