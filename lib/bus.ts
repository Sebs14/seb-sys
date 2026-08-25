/* ══════════════════════════════════════════════════════════════
   BUS DE EVENTOS

   La terminal dispara efectos que viven en otros componentes (el
   gato, la lluvia, abrir un proyecto). Pasar callbacks por props
   obligaría a subir todo ese estado al layout; un evento del
   window mantiene cada pieza independiente y apagable.
   ══════════════════════════════════════════════════════════════ */

export type BusEvent =
  | { type: "cat"; on: boolean }
  | { type: "matrix" }
  | { type: "glitch" }
  | { type: "open-project"; id: string }
  | { type: "terminal"; open: boolean }
  /** Clic en un nodo del grafo: la terminal se abre y escribe la ficha. */
  | { type: "print-project"; id: string }
  | { type: "webcam"; on: boolean }
  /** Cualquier pieza puede escribir una línea en la terminal: el
      feedback tiene que aparecer donde el usuario escribió el comando. */
  | { type: "notice"; text: string }
  | { type: "train" }
  | { type: "vim" }
  | { type: "poweroff" };

const NAME = "seb.sys";

export function emit(event: BusEvent) {
  window.dispatchEvent(new CustomEvent(NAME, { detail: event }));
}

/** Suscribe y devuelve la función de limpieza. */
export function on(handler: (event: BusEvent) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<BusEvent>).detail);
  window.addEventListener(NAME, listener);
  return () => window.removeEventListener(NAME, listener);
}
