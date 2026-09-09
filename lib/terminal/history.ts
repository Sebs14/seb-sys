/* ══════════════════════════════════════════════════════════════
   HISTORIAL DE LA TERMINAL — funciones puras

   Contrato: `cursor` vale -1 cuando el usuario está en su borrador y
   entre 0 y `entries.length - 1` cuando navega el historial (0 es el
   comando más reciente). El borrador se guarda al entrar al historial
   y se restaura al volver a -1. Nunca se sale del rango válido.
   ══════════════════════════════════════════════════════════════ */

export type HistoryState = {
  /** más reciente primero */
  entries: string[];
  cursor: number;
  draft: string;
};

export const HISTORY_LIMIT = 100;

export const emptyHistory: HistoryState = { entries: [], cursor: -1, draft: "" };

export function pushEntry(
  state: HistoryState,
  command: string,
  limit = HISTORY_LIMIT,
): HistoryState {
  const trimmed = command.trim();
  if (!trimmed) return { ...state, cursor: -1, draft: "" };
  return {
    entries: [trimmed, ...state.entries].slice(0, limit),
    cursor: -1,
    draft: "",
  };
}

export function moveUp(
  state: HistoryState,
  currentValue: string,
): { state: HistoryState; value: string } {
  if (state.entries.length === 0) return { state, value: currentValue };
  const next = Math.min(state.cursor + 1, state.entries.length - 1);
  // Al salir del borrador lo guardamos para poder volver a él.
  const draft = state.cursor === -1 ? currentValue : state.draft;
  return {
    state: { ...state, cursor: next, draft },
    value: state.entries[next],
  };
}

export function moveDown(state: HistoryState): { state: HistoryState; value: string } {
  if (state.cursor === -1) return { state, value: state.draft };
  const next = Math.max(-1, state.cursor - 1);
  return {
    state: { ...state, cursor: next },
    value: next >= 0 ? state.entries[next] : state.draft,
  };
}
