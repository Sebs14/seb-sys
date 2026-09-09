import { describe, expect, it } from "vitest";
import { parseCommand, resolveProjectArg } from "@/lib/terminal/parse-command";

const projects = [
  { id: "fluidez-lectora", name: "Evaluación de fluidez lectora" },
  { id: "gamificacion-lxp", name: "Motor de gamificación" },
  { id: "horarios-escolares", name: "Horarios escolares" },
  { id: "ascii-portfolio", name: "seb.sys" },
];

describe("parseCommand", () => {
  it("separa nombre y argumentos, normalizando el nombre", () => {
    expect(parseCommand("  OPEN  2 ")).toEqual({
      name: "open",
      args: ["2"],
      arg: "2",
      raw: "OPEN  2",
    });
  });
  it("devuelve null con entrada vacía", () => {
    expect(parseCommand("   ")).toBeNull();
  });
});

describe("resolveProjectArg", () => {
  it("open sin argumento pide uso, no elige el primero", () => {
    expect(resolveProjectArg("", projects)).toEqual({ kind: "usage" });
  });
  it("open 1 abre el primero por orden", () => {
    expect(resolveProjectArg("1", projects)).toMatchObject({
      kind: "found",
      index: 0,
      project: { id: "fluidez-lectora" },
    });
  });
  it("open 0 y open 99 no existen", () => {
    expect(resolveProjectArg("0", projects)).toEqual({ kind: "not-found" });
    expect(resolveProjectArg("99", projects)).toEqual({ kind: "not-found" });
  });
  it("open 1abc no se acepta como open 1", () => {
    expect(resolveProjectArg("1abc", projects)).toEqual({ kind: "not-found" });
  });
  it("busca por id y por nombre", () => {
    expect(resolveProjectArg("ascii-portfolio", projects)).toMatchObject({
      kind: "found",
      project: { id: "ascii-portfolio" },
    });
    expect(resolveProjectArg("gamific", projects)).toMatchObject({
      kind: "found",
      project: { id: "gamificacion-lxp" },
    });
  });
  it("con varias coincidencias devuelve candidatos", () => {
    const result = resolveProjectArg("or", projects);
    expect(result.kind).toBe("ambiguous");
    if (result.kind === "ambiguous") expect(result.candidates.length).toBeGreaterThan(1);
  });
});
