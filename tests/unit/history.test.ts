import { describe, expect, it } from "vitest";
import { emptyHistory, moveDown, moveUp, pushEntry } from "@/lib/terminal/history";

describe("historial de la terminal", () => {
  it("historial vacío: las flechas no cambian nada ni salen del rango", () => {
    const up = moveUp(emptyHistory, "borrador");
    expect(up.state.cursor).toBe(-1);
    expect(up.value).toBe("borrador");
    const down = moveDown(emptyHistory);
    expect(down.state.cursor).toBe(-1);
    expect(down.value).toBe("");
  });

  it("BUG-04: help, ↓, ↑ vuelve a help", () => {
    let state = pushEntry(emptyHistory, "help");
    const down = moveDown(state);
    state = down.state;
    expect(state.cursor).toBe(-1);
    const up = moveUp(state, "");
    expect(up.value).toBe("help");
    expect(up.state.cursor).toBe(0);
  });

  it("varios comandos: sube hasta el más viejo y baja hasta el borrador", () => {
    let state = pushEntry(pushEntry(pushEntry(emptyHistory, "a"), "b"), "c");
    expect(state.entries).toEqual(["c", "b", "a"]);

    let step = moveUp(state, "escribiendo");
    expect(step.value).toBe("c");
    step = moveUp(step.state, step.value);
    expect(step.value).toBe("b");
    step = moveUp(step.state, step.value);
    expect(step.value).toBe("a");
    // Límite superior: repetir ↑ se queda en el más viejo.
    step = moveUp(step.state, step.value);
    expect(step.value).toBe("a");
    expect(step.state.cursor).toBe(2);

    step = moveDown(step.state);
    expect(step.value).toBe("b");
    step = moveDown(step.state);
    expect(step.value).toBe("c");
    // Volver al borrador que se estaba escribiendo.
    step = moveDown(step.state);
    expect(step.value).toBe("escribiendo");
    expect(step.state.cursor).toBe(-1);
    // Límite inferior: repetir ↓ no baja de -1.
    step = moveDown(step.state);
    expect(step.state.cursor).toBe(-1);
    expect(step.value).toBe("escribiendo");
    state = step.state;
  });

  it("respeta el límite y descarta lo más viejo", () => {
    let state = emptyHistory;
    for (let i = 0; i < 120; i += 1) state = pushEntry(state, `cmd ${i}`);
    expect(state.entries).toHaveLength(100);
    expect(state.entries[0]).toBe("cmd 119");
    expect(state.entries.at(-1)).toBe("cmd 20");
  });

  it("no guarda comandos vacíos pero sí reinicia el cursor", () => {
    const state = pushEntry({ entries: ["x"], cursor: 0, draft: "d" }, "   ");
    expect(state.entries).toEqual(["x"]);
    expect(state.cursor).toBe(-1);
  });
});
