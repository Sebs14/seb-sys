/* ══════════════════════════════════════════════════════════════
   BUS DE EVENTOS

   La terminal dispara efectos que viven en otros componentes (el
   gato, la lluvia, abrir un proyecto). Pasar callbacks por props
   obligaría a subir todo ese estado al layout; un evento del
   window mantiene cada pieza independiente y apagable.

   Distinción importante: `select-project` ELIGE una pieza en la escena
   y la ficha (sin mover la página); `open-project` abre el detalle en
   la lista y desplaza hasta ahí; `print-project` escribe la ficha en
   la terminal. Son tres intenciones distintas.
   ══════════════════════════════════════════════════════════════ */

export type RecreationalEffect = "matrix" | "train" | "vim" | "poweroff" | "screensaver";

export type BusEvent =
  | { type: "cat"; on: boolean }
  | { type: "effect"; name: RecreationalEffect }
  /** Abre el detalle del proyecto en la lista y lo enfoca. */
  | { type: "open-project"; id: string }
  /** Cambia la pieza seleccionada en la escena y su ficha. */
  | { type: "select-project"; id: string }
  /** Cambia el modo de la escena (lo usan laboratorio y terminal). */
  | { type: "scene-mode"; mode: "core" | "systems" | "ascii" }
  | { type: "terminal"; open: boolean }
  /** Abre la terminal y escribe la ficha del proyecto. */
  | { type: "print-project"; id: string }
  | { type: "webcam"; on: boolean }
  /** Cualquier pieza puede escribir una línea en la terminal: el
      feedback tiene que aparecer donde el usuario escribió el comando. */
  | { type: "notice"; text: string }
  /** Modo CRT del laboratorio: scanlines, estrellas y desgarro. */
  | { type: "crt"; on: boolean };

const NAME = "seb.sys";

export function emit(event: BusEvent) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NAME, { detail: event }));
}

/** Suscribe y devuelve la función de limpieza. */
export function on(handler: (event: BusEvent) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => handler((e as CustomEvent<BusEvent>).detail);
  window.addEventListener(NAME, listener);
  return () => window.removeEventListener(NAME, listener);
}
