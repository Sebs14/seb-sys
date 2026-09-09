import { describe, expect, it } from "vitest";
import { runCommand } from "@/lib/terminal/commands";
import { projects } from "@/lib/content";

const ctx = { lang: "es" as const };

describe("runCommand", () => {
  it("help lista comandos y hace eco de la entrada", () => {
    const r = runCommand("help", ctx);
    expect(r.lines[0]).toEqual({ kind: "in", text: "help" });
    expect(r.lines.some((l) => l.text.includes("open <n|nombre>"))).toBe(true);
    expect(r.effects).toEqual([]);
  });

  it("open 1 imprime el primer proyecto y abre/selecciona su detalle", () => {
    const r = runCommand("open 1", ctx);
    expect(r.effects).toEqual([
      { type: "select-project", id: projects[0].id },
      { type: "open-project", id: projects[0].id },
    ]);
    expect(r.lines.some((l) => l.text.includes(projects[0].name))).toBe(true);
  });

  it("open sin argumento, open 0, open 99 y open 1abc no abren nada", () => {
    for (const cmd of ["open", "open 0", "open 99", "open 1abc"]) {
      const r = runCommand(cmd, ctx);
      expect(r.effects, cmd).toEqual([]);
      expect(r.lines.length, cmd).toBeGreaterThan(1);
    }
    expect(runCommand("open", ctx).lines[1].text).toContain("uso");
    expect(runCommand("open 0", ctx).lines[1].kind).toBe("err");
  });

  it("cd proyectos y cat contacto conservan su intención en los dos idiomas", () => {
    expect(runCommand("cd proyectos", ctx).effects).toEqual([{ type: "scroll", target: "work" }]);
    expect(runCommand("cd work", { lang: "en" }).effects).toEqual([{ type: "scroll", target: "work" }]);
    const cat = runCommand("cat contacto", ctx);
    expect(cat.lines.some((l) => l.text.includes("EMAIL"))).toBe(true);
  });

  it("cat stack no muestra niveles numéricos", () => {
    const r = runCommand("cat stack", ctx);
    const text = r.lines.map((l) => l.text).join("\n");
    expect(text).not.toMatch(/█|\s\d{2,3}\s*$/m);
    expect(text).toContain("Next.js");
  });

  it("lang, clear, exit y theme producen efectos tipados", () => {
    expect(runCommand("lang en", ctx).effects).toEqual([{ type: "set-lang", lang: "en" }]);
    expect(runCommand("lang xx", ctx).effects).toEqual([]);
    expect(runCommand("clear", ctx)).toEqual({ lines: [], effects: [{ type: "clear" }] });
    expect(runCommand("exit", ctx).effects).toEqual([{ type: "close" }]);
    expect(runCommand("theme amber", ctx).effects).toEqual([{ type: "theme", phosphor: "amber" }]);
    expect(runCommand("theme verde", ctx).effects).toEqual([{ type: "theme", phosphor: "green" }]);
  });

  it("rm y sudo son chistes, sin efectos", () => {
    expect(runCommand("rm -rf /", ctx).effects).toEqual([]);
    expect(runCommand("sudo make me a sandwich", ctx).effects).toEqual([]);
  });

  it("comando desconocido informa y sugiere help", () => {
    const r = runCommand("foo", ctx);
    expect(r.lines[1].kind).toBe("err");
    expect(r.lines[2].text).toContain("help");
  });
});
