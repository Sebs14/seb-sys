import { describe, expect, it } from "vitest";
import { buildExpertise } from "@/lib/expertise";
import { projects, stack } from "@/lib/content";

describe("stack con evidencia", () => {
  const groups = buildExpertise(projects, stack);
  const all = groups.flatMap((g) => g.items);

  it("cada tecnología lista los proyectos donde aparece, por tag exacto", () => {
    const next = all.find((i) => i.name === "Next.js");
    expect(next?.projectIds).toEqual(
      projects.filter((p) => p.tags.includes("Next.js")).map((p) => p.id),
    );
  });

  it("no muestra tecnologías del stack sin proyecto que las respalde", () => {
    expect(all.find((i) => i.name === "Tailwind")).toBeUndefined();
    expect(all.find((i) => i.name === "Expo / RN")).toBeUndefined();
  });

  it("los tags fuera del stack van al grupo de herramientas", () => {
    const other = groups.at(-1);
    expect(other?.items.map((i) => i.name)).toContain("Pub/Sub");
  });

  it("no expone niveles numéricos", () => {
    all.forEach((item) => expect(item).not.toHaveProperty("level"));
  });
});
