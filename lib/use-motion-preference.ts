"use client";

import { useCallback } from "react";
import { createMediaStore, createStore, useStoreValue } from "./preference-store";

/* ══════════════════════════════════════════════════════════════
   PREFERENCIA DE MOVIMIENTO

   Una sola fuente de verdad, compartida por el texto, la escena y la
   terminal:

     - `reduced`: el sistema pide movimiento reducido (matchMedia, en
       vivo).
     - `paused`: el visitante pulsó "Pausar movimiento" en esta sesión.
     - `still`: cualquiera de las dos. Es lo que consultan los timers
       y los shaders para no avanzar.

   Compatible con SSR: el servidor renderiza como si hubiera movimiento
   (false) y el cliente corrige en el primer render después de hidratar.
   ══════════════════════════════════════════════════════════════ */

const reducedStore = createMediaStore("(prefers-reduced-motion: reduce)");
const pausedStore = createStore(false);

export type MotionPreference = {
  reduced: boolean;
  paused: boolean;
  /** true si no debe haber movimiento automático de ningún tipo */
  still: boolean;
  setPaused: (paused: boolean) => void;
};

export function useMotionPreference(): MotionPreference {
  const reduced = useStoreValue(reducedStore, false);
  const paused = useStoreValue(pausedStore, false);
  const setPaused = useCallback((next: boolean) => pausedStore.set(next), []);
  return { reduced, paused, still: reduced || paused, setPaused };
}

/** Lectura imperativa, para código que corre fuera del render. */
export function motionIsStill(): boolean {
  return reducedStore.get() || pausedStore.get();
}

export function motionIsReduced(): boolean {
  return reducedStore.get();
}

/** Suscripción imperativa: avisa cuando cambia cualquiera de las dos. */
export function onMotionChange(listener: () => void): () => void {
  const a = reducedStore.subscribe(listener);
  const b = pausedStore.subscribe(listener);
  return () => {
    a();
    b();
  };
}
