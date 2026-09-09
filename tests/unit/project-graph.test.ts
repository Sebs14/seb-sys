import { describe, expect, it } from "vitest";
import { buildGraph, connectionsOf, sharedTags } from "@/lib/project-graph";
import { projects } from "@/lib/content";

describe("grafo de proyectos", () => {
  it("las aristas salen de tags compartidos exactos y guardan cuáles", () => {
    const graph = buildGraph(projects);
    const byId = (id: string) => graph.nodes.findIndex((n) => n.id === id);
    const edge = graph.edges.find(
      (e) =>
        (e.a === byId("fluidez-lectora") && e.b === byId("gamificacion-lxp")) ||
        (e.b === byId("fluidez-lectora") && e.a === byId("gamificacion-lxp")),
    );
    expect(edge).toBeDefined();
    expect(edge?.sharedTags.sort()).toEqual(["Next.js", "PostgreSQL"]);
    expect(edge?.weight).toBe(2);
  });

  it("React y Next.js no se consideran la misma tecnología", () => {
    expect(sharedTags(["React"], ["Next.js"])).toEqual([]);
  });

  it("es determinista y encuadra al radio pedido", () => {
    const a = buildGraph(projects, { radius: 1.75 });
    const b = buildGraph(projects, { radius: 1.75 });
    expect(a).toEqual(b);
    const max = Math.max(...a.nodes.map((n) => Math.hypot(...n.position)));
    expect(max).toBeCloseTo(1.75, 5);
    expect(a.nodes).toHaveLength(projects.length);
  });

  it("todos los nodos tienen al menos una conexión en el contenido actual", () => {
    const graph = buildGraph(projects);
    graph.nodes.forEach((n) => {
      expect(connectionsOf(graph, n.id).length).toBeGreaterThan(0);
    });
  });
});
