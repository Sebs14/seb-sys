"use client";

import { useEffect } from "react";

/* ══════════════════════════════════════════════════════════════
   PÉRDIDA DE SINCRONÍA VERTICAL

   Si el sitio finge ser un monitor de fósforo, tiene que poder
   perder el V-hold: al hacer scroll fuerte la imagen se desgarra y
   rueda un instante, como cuando a un CRT se le iba la sincronía.

   Se dispara con la VELOCIDAD real del scroll, no con el scroll: un
   desplazamiento tranquilo no rompe nada, y el efecto sólo existe
   mientras dura el impulso.

   Barato a propósito: un `transform` sobre un solo elemento (lo mueve
   el compositor) y nada de animación continua. El transform se
   BORRA al terminar para no dejar una capa promovida de por vida.
   ══════════════════════════════════════════════════════════════ */

/** px por milisegundo a partir de los cuales se pierde la sincronía. */
const THRESHOLD = 2.4;
/** desplazamiento máximo del desgarro, en px */
const MAX_TEAR = 14;

export function VHold() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = document.getElementById("main");
    if (!target) return;

    let lastY = window.scrollY;
    let lastT = performance.now();
    let raf = 0;
    let until = 0;
    let amplitude = 0;

    const roll = () => {
      const now = performance.now();
      if (now >= until) {
        raf = 0;
        // Sin transform: el elemento vuelve a no tener capa propia.
        target.style.transform = "";
        return;
      }
      // Rueda hacia abajo y se apaga: dos o tres saltos, no un temblor.
      const left = (until - now) / 90;
      const offset = Math.round(Math.sin(now / 16) * amplitude * left);
      target.style.transform = `translate3d(0, ${offset}px, 0)`;
      raf = requestAnimationFrame(roll);
    };

    const onScroll = () => {
      const now = performance.now();
      const dt = now - lastT;
      if (dt < 8) return;
      const speed = Math.abs(window.scrollY - lastY) / dt;
      lastY = window.scrollY;
      lastT = now;

      if (speed < THRESHOLD) return;
      amplitude = Math.min(MAX_TEAR, (speed - THRESHOLD) * 6);
      until = now + 90;
      if (!raf) raf = requestAnimationFrame(roll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      target.style.transform = "";
    };
  }, []);

  return null;
}
