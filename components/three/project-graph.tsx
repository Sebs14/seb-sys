"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { projects } from "@/lib/content";
import { emit } from "@/lib/bus";

/* ══════════════════════════════════════════════════════════════
   GRAFO DE PROYECTOS EN 3D

   El toro giraba lindo pero no decía nada. Esto sí: cada nodo es un
   proyecto y cada arista es una tecnología compartida, así que la
   forma de la nube ES el mapa de lo que sabe hacer quien la mira.

   Pasa por el mismo shader ASCII que todo lo demás, y el raycasting
   sigue funcionando: el pase de post-proceso dibuja glifos, pero la
   escena real está ahí abajo con la misma cámara — hacés clic donde
   VES el nodo y le pegás al nodo.

   Las aristas NO son líneas: una línea de un píxel no junta
   suficiente luminancia para que el shader elija un glifo y
   desaparece. Son cilindros finos con material emisivo.
   ══════════════════════════════════════════════════════════════ */

type Node = {
  id: string;
  name: string;
  featured: boolean;
  /** cuántas tecnologías comparte con el resto: define su tamaño */
  degree: number;
  pos: THREE.Vector3;
};

type Edge = { a: number; b: number; weight: number };

/** Generador determinista: el grafo tiene que salir igual siempre. */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Aristas por tecnología compartida, y posiciones por relajación de
 * fuerzas: repulsión entre todos los pares, resorte en las aristas y
 * un tirón suave al centro. Con 7 nodos converge en 300 pasos y sale
 * gratis; no hace falta simular en cada cuadro.
 */
function buildGraph() {
  const rand = lcg(20260820);

  const nodes: Node[] = projects.map((p) => ({
    id: p.id,
    name: p.name,
    featured: !!p.featured,
    degree: 0,
    // Arranque en una esfera, para que la relajación no empiece plana.
    pos: new THREE.Vector3(
      rand() * 2 - 1,
      rand() * 2 - 1,
      rand() * 2 - 1,
    ).normalize().multiplyScalar(1.4 + rand() * 0.5),
  }));

  const edges: Edge[] = [];
  for (let i = 0; i < projects.length; i += 1) {
    for (let j = i + 1; j < projects.length; j += 1) {
      const shared = projects[i].tags.filter((t) => projects[j].tags.includes(t));
      if (shared.length) {
        edges.push({ a: i, b: j, weight: shared.length });
        nodes[i].degree += shared.length;
        nodes[j].degree += shared.length;
      }
    }
  }

  // ── relajación ──────────────────────────────────────────────
  const delta = new THREE.Vector3();
  for (let step = 0; step < 300; step += 1) {
    const force = nodes.map(() => new THREE.Vector3());

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        delta.subVectors(nodes[i].pos, nodes[j].pos);
        const d = Math.max(0.25, delta.length());
        delta.multiplyScalar(1.6 / (d * d * d));
        force[i].add(delta);
        force[j].sub(delta);
      }
    }

    edges.forEach((e) => {
      delta.subVectors(nodes[e.b].pos, nodes[e.a].pos);
      const d = delta.length();
      // Más tecnologías compartidas = resorte más corto: los parecidos
      // terminan juntos y eso se ve.
      const rest = 2.3 - Math.min(1.1, e.weight * 0.28);
      delta.multiplyScalar((d - rest) * 0.06);
      force[e.a].add(delta);
      force[e.b].sub(delta);
    });

    nodes.forEach((n, i) => {
      force[i].addScaledVector(n.pos, -0.02); // al centro
      n.pos.addScaledVector(force[i], 0.5);
    });
  }

  // Encuadre: centrar y escalar para que entre siempre en cámara.
  const center = nodes
    .reduce((acc, n) => acc.add(n.pos), new THREE.Vector3())
    .divideScalar(nodes.length);
  let radius = 0;
  nodes.forEach((n) => {
    n.pos.sub(center);
    radius = Math.max(radius, n.pos.length());
  });
  const scale = 1.75 / (radius || 1);
  nodes.forEach((n) => n.pos.multiplyScalar(scale));

  return { nodes, edges };
}

/** Cilindro orientado de a → b. Un `lookAt` no sirve: la geometría del
    cilindro nace apuntando a +Y, así que hay que rotar desde ese eje. */
function Edge3D({
  from,
  to,
  weight,
  lit,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  weight: number;
  lit: boolean;
}) {
  const { position, quaternion, length } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    );
    return {
      position: new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5),
      quaternion: q,
      length: len,
    };
  }, [from, to]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[0.022 + weight * 0.006, 0.022 + weight * 0.006, length, 6]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={lit ? 1.1 : 0.32}
        roughness={0.9}
      />
    </mesh>
  );
}

export function ProjectGraph({
  frozen,
  onHover,
}: {
  frozen: boolean;
  /** Avisa hacia afuera qué nodo está bajo el puntero, para rotularlo
      en DOM: un rótulo dentro del ASCII sería ilegible. */
  onHover: (name: string | null) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const { nodes, edges } = useMemo(() => buildGraph(), []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g || frozen) return;
    g.rotation.y += dt * 0.16;
    // El puntero inclina, no arrastra: se siente como mirar el objeto.
    const { x, y } = state.pointer;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, y * 0.45, 0.04);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, x * 0.12, 0.04);
  });

  return (
    <group ref={group}>
      {edges.map((e, i) => (
        <Edge3D
          key={i}
          from={nodes[e.a].pos}
          to={nodes[e.b].pos}
          weight={e.weight}
          lit={hovered === e.a || hovered === e.b}
        />
      ))}

      {nodes.map((n, i) => {
        const on = hovered === i;
        const base = (n.featured ? 0.3 : 0.22) + Math.min(0.12, n.degree * 0.012);
        return (
          <mesh
            key={n.id}
            position={n.pos}
            scale={on ? 1.35 : 1}
            onPointerOver={(event) => {
              event.stopPropagation();
              setHovered(i);
              onHover(n.name);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHovered(null);
              onHover(null);
              document.body.style.cursor = "";
            }}
            onClick={(event) => {
              event.stopPropagation();
              // Clic en el grafo = la terminal te escribe la ficha.
              emit({ type: "print-project", id: n.id });
            }}
          >
            <icosahedronGeometry args={[base, 1]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={on ? 1.4 : 0.5}
              roughness={0.35}
              metalness={0.05}
            />
          </mesh>
        );
      })}
    </group>
  );
}
