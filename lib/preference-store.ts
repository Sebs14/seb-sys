import { useSyncExternalStore } from "react";

/* ══════════════════════════════════════════════════════════════
   STORE DE PREFERENCIAS

   Un contenedor mínimo para valores que viven fuera de React
   (localStorage, matchMedia, pausas de sesión). Se consume con
   `useSyncExternalStore`, así el HTML del servidor y el primer render
   del cliente coinciden SIEMPRE: React usa el snapshot del servidor
   para hidratar y después se actualiza al valor real. Nada de
   setState dentro de un efecto, nada de mismatch.
   ══════════════════════════════════════════════════════════════ */

export type Store<T> = {
  get: () => T;
  set: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
};

export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(next) {
      if (Object.is(next, value)) return;
      value = next;
      listeners.forEach((fn) => fn());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/**
 * Lee un store con snapshot de servidor explícito. `serverValue` es lo
 * que se renderiza en SSR y durante la hidratación.
 */
export function useStoreValue<T>(store: Store<T>, serverValue: T): T {
  return useSyncExternalStore(store.subscribe, store.get, () => serverValue);
}

/* ── almacenamiento tolerante ────────────────────────────────────
   La navegación privada, un bloqueo de cookies o una política de
   empresa hacen que `localStorage` lance. El sitio no puede romperse
   por una preferencia que no se pudo guardar.                        */

export function readStorage(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string | null): void {
  try {
    if (typeof window === "undefined") return;
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Sin permiso de almacenamiento: la preferencia dura la sesión.
  }
}

/**
 * Store respaldado por una media query. El snapshot del servidor es
 * `false` (no podemos saber la preferencia sin navegador), y en el
 * cliente se sincroniza con el sistema, incluidos los cambios en vivo.
 */
export function createMediaStore(query: string): Store<boolean> {
  const store = createStore(false);
  if (typeof window !== "undefined" && "matchMedia" in window) {
    const mq = window.matchMedia(query);
    store.set(mq.matches);
    mq.addEventListener("change", (event) => store.set(event.matches));
  }
  return store;
}
