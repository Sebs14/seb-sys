"use client";

import { useEffect } from "react";
import { motionIsStill } from "@/lib/use-motion-preference";

/* Pérdida de sincronía vertical al hacer scroll fuerte. Sólo existe en
   modo CRT del laboratorio y se apaga con movimiento reducido. */

const THRESHOLD = 2.4;
const MAX_TEAR = 14;

export function VHold() {
  useEffect(() => {
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
        target.style.transform = "";
        return;
      }
      const left = (until - now) / 90;
      const offset = Math.round(Math.sin(now / 16) * amplitude * left);
      target.style.transform = `translate3d(0, ${offset}px, 0)`;
      raf = requestAnimationFrame(roll);
    };

    const onScroll = () => {
      if (motionIsStill()) return;
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
