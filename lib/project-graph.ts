/* ══════════════════════════════════════════════════════════════
   GRAFO DE PROYECTOS — construcción pura

   Cada nodo es un proyecto y cada arista es una tecnología compartida
   por coincidencia EXACTA de `tags`. No hay tabla de equivalencias:
   React y Next.js son dos cosas, y si alguna vez se decide lo
   contrario tendrá que ser explícito y probado.

   Las posiciones salen de una relajación de fuerzas determinista
   (semilla fija): repulsión entre todos los pares, resorte en las
   aristas y un tirón suave al centro. Con siete nodos converge en
   pocos cientos de pasos y se calcula una sola vez por conjunto de
   proyectos; nunca en el bucle de render.

   Sin dependencia de Three: se prueba en Node y la escena lo consume
   como números.
   ══════════════════════════════════════════════════════════════ */

export type Vec3 = [number, number, number];

export type GraphInput = {
  id: string;
  name: string;
  featured?: boolean;
  tags: string[];
};

export type GraphNode = {
  id: string;
  name: string;
  featured: boolean;
  /** suma de tecnologías compartidas con el resto */
  degree: number;
  position: Vec3;
};

export type GraphEdge = {
  /** índices en `nodes` */
  a: number;
  b: number;
  weight: number;
  sharedTags: string[];
};

export type ProjectGraph = { nodes: GraphNode[]; edges: GraphEdge[] };

/** Generador congruencial: el grafo tiene que salir igual siempre. */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function sharedTags(a: readonly string[], b: readonly string[]): string[] {
  const set = new Set(b);
  return a.filter((tag) => set.has(tag));
}

export function buildGraph(
  projects: readonly GraphInput[],
  {
    seed = 20260820,
    radius = 1.75,
    steps = 300,
  }: { seed?: number; radius?: number; steps?: number } = {},
): ProjectGraph {
  const rand = lcg(seed);

  const pos: Vec3[] = projects.map(() => {
    const v: Vec3 = [rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1];
    const len = Math.hypot(...v) || 1;
    const r = 1.4 + rand() * 0.5;
    return [(v[0] / len) * r, (v[1] / len) * r, (v[2] / len) * r];
  });

  const nodes: GraphNode[] = projects.map((p, i) => ({
    id: p.id,
    name: p.name,
    featured: !!p.featured,
    degree: 0,
    position: pos[i],
  }));

  const edges: GraphEdge[] = [];
  for (let i = 0; i < projects.length; i += 1) {
    for (let j = i + 1; j < projects.length; j += 1) {
      const shared = sharedTags(projects[i].tags, projects[j].tags);
      if (shared.length) {
        edges.push({ a: i, b: j, weight: shared.length, sharedTags: shared });
        nodes[i].degree += shared.length;
        nodes[j].degree += shared.length;
      }
    }
  }

  // ── relajación ────────────────────────────────────────────────
  for (let step = 0; step < steps; step += 1) {
    const force: Vec3[] = nodes.map(() => [0, 0, 0]);

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const dx = pos[i][0] - pos[j][0];
        const dy = pos[i][1] - pos[j][1];
        const dz = pos[i][2] - pos[j][2];
        const d = Math.max(0.25, Math.hypot(dx, dy, dz));
        const k = 1.6 / (d * d * d);
        force[i][0] += dx * k;
        force[i][1] += dy * k;
        force[i][2] += dz * k;
        force[j][0] -= dx * k;
        force[j][1] -= dy * k;
        force[j][2] -= dz * k;
      }
    }

    edges.forEach((e) => {
      const dx = pos[e.b][0] - pos[e.a][0];
      const dy = pos[e.b][1] - pos[e.a][1];
      const dz = pos[e.b][2] - pos[e.a][2];
      const d = Math.hypot(dx, dy, dz);
      // Más tecnologías compartidas = resorte más corto: los parecidos
      // terminan juntos y eso se ve.
      const rest = 2.3 - Math.min(1.1, e.weight * 0.28);
      const k = ((d - rest) * 0.06) / (d || 1);
      force[e.a][0] += dx * k;
      force[e.a][1] += dy * k;
      force[e.a][2] += dz * k;
      force[e.b][0] -= dx * k;
      force[e.b][1] -= dy * k;
      force[e.b][2] -= dz * k;
    });

    nodes.forEach((_, i) => {
      force[i][0] -= pos[i][0] * 0.02;
      force[i][1] -= pos[i][1] * 0.02;
      force[i][2] -= pos[i][2] * 0.02;
      pos[i][0] += force[i][0] * 0.5;
      pos[i][1] += force[i][1] * 0.5;
      pos[i][2] += force[i][2] * 0.5;
    });
  }

  // ── encuadre: centrar y escalar a `radius` ────────────────────
  const n = nodes.length || 1;
  const center: Vec3 = [0, 0, 0];
  pos.forEach((p) => {
    center[0] += p[0] / n;
    center[1] += p[1] / n;
    center[2] += p[2] / n;
  });
  let maxLen = 0;
  pos.forEach((p) => {
    p[0] -= center[0];
    p[1] -= center[1];
    p[2] -= center[2];
    maxLen = Math.max(maxLen, Math.hypot(...p));
  });
  const scale = radius / (maxLen || 1);
  nodes.forEach((node, i) => {
    node.position = [pos[i][0] * scale, pos[i][1] * scale, pos[i][2] * scale];
  });

  return { nodes, edges };
}

/** Aristas que tocan un nodo, útil para resaltar la selección. */
export function edgesOf(graph: ProjectGraph, nodeIndex: number): GraphEdge[] {
  return graph.edges.filter((e) => e.a === nodeIndex || e.b === nodeIndex);
}

/** Tecnologías que justifican la conexión de un nodo con el resto. */
export function connectionsOf(
  graph: ProjectGraph,
  nodeId: string,
): { id: string; name: string; sharedTags: string[] }[] {
  const index = graph.nodes.findIndex((n) => n.id === nodeId);
  if (index < 0) return [];
  return edgesOf(graph, index).map((e) => {
    const other = graph.nodes[e.a === index ? e.b : e.a];
    return { id: other.id, name: other.name, sharedTags: e.sharedTags };
  });
}
