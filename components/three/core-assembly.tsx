"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { projects } from "@/lib/content";
import type { ProjectGraph } from "@/lib/project-graph";
import type { QualityTier, SceneMode } from "@/lib/scene-types";
import { CORE, SCENE_CONFIG } from "@/lib/scene-config";
import { PIECE_SPRING, stepSpring, type Spring1D } from "@/lib/spring";
import { sceneStats } from "@/lib/scene-stats";
import { buildPieces, graphPose, ringPose } from "./core-geometry";
import type { Rig } from "./scene-rig";

/* ══════════════════════════════════════════════════════════════
   NÚCLEO DE SISTEMAS — las siete piezas

   Un solo grupo con siete mallas de aluminio. Cada pieza tiene una
   pose objetivo según el modo (anillo o nodo del grafo) y llega a ella
   con resortes que viven en refs: interrumpibles, reversibles y sin
   setState por cuadro. Las aristas del grafo son UNA malla
   instanciada que sigue a las piezas mientras se mueven.

   Materiales: un MeshPhysicalMaterial por pieza (mismo programa,
   distintos uniforms) para poder levantar el brillo de la pieza bajo
   el puntero y marcar la seleccionada sin tocar a las demás.
   ══════════════════════════════════════════════════════════════ */

const ALUMINIUM = "#dde2e7";
const ACCENT = "#9ef5b5";
const ACCENT_STRONG = "#54df86";
const EDGE_DIM = "#6b7785";

type PieceState = {
  pos: [Spring1D, Spring1D, Spring1D];
  quat: THREE.Quaternion;
  scale: Spring1D;
  glow: Spring1D; // emissive
  mark: Spring1D; // opacidad de la marca
};

type Props = {
  rig: Rig;
  quality: QualityTier;
  mode: SceneMode;
  selectedId: string;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  /** sin movimiento automático: todo se coloca de golpe */
  still: boolean;
  hidden: boolean;
  graph: ProjectGraph;
  /** avisa cuando el conjunto dejó de moverse (para dormir el render) */
  onSettle?: () => void;
};

const tmpV = new THREE.Vector3();
const tmpV2 = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();
const tmpM = new THREE.Matrix4();
const tmpS = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

export function CoreAssembly({
  rig,
  quality,
  mode,
  selectedId,
  hoveredId,
  onHover,
  onSelect,
  still,
  hidden,
  graph,
  onSettle,
}: Props) {
  const invalidate = useThree((s) => s.invalidate);
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const marks = useRef<(THREE.Mesh | null)[]>([]);
  const edgesRef = useRef<THREE.InstancedMesh>(null);
  const settled = useRef(false);

  const cfg = SCENE_CONFIG[quality];

  // ── geometrías: una vez por calidad ────────────────────────────
  const geometries = useMemo(
    () => buildPieces({ segments: cfg.arcSegments, cornerPoints: Math.max(2, Math.round(cfg.profilePoints / 4)) }),
    [cfg.arcSegments, cfg.profilePoints],
  );
  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);

  const markGeometry = useMemo(() => new THREE.BoxGeometry(0.11, 0.014, 0.05), []);
  useEffect(() => () => markGeometry.dispose(), [markGeometry]);

  const edgeGeometry = useMemo(
    () => new THREE.CylinderGeometry(1, 1, 1, cfg.edgeSegments, 1, true),
    [cfg.edgeSegments],
  );
  useEffect(() => () => edgeGeometry.dispose(), [edgeGeometry]);

  // ── materiales ────────────────────────────────────────────────
  const materials = useMemo(
    () =>
      projects.map(() => {
        const m = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(ALUMINIUM),
          metalness: 1,
          roughness: 0.3,
          envMapIntensity: 1.2,
          emissive: new THREE.Color(ACCENT),
          emissiveIntensity: 0,
        });
        m.anisotropy = 0.55;
        return m;
      }),
    [],
  );
  const markMaterials = useMemo(
    () =>
      projects.map(
        () =>
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(ACCENT_STRONG),
            transparent: true,
            opacity: 0.18,
            toneMapped: false,
          }),
      ),
    [],
  );
  const edgeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#ffffff"),
        emissive: new THREE.Color("#ffffff"),
        emissiveIntensity: 0.6,
        roughness: 0.7,
        metalness: 0.2,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [],
  );
  useEffect(
    () => () => {
      materials.forEach((m) => m.dispose());
      markMaterials.forEach((m) => m.dispose());
      edgeMaterial.dispose();
    },
    [materials, markMaterials, edgeMaterial],
  );

  // ── estado por pieza (refs) ───────────────────────────────────
  const state = useRef<PieceState[] | null>(null);
  if (state.current === null) {
    state.current = projects.map((_, i) => {
      const ring = ringPose(i);
      // Entrada: cerca de la pose final, un poco afuera y girada ≤12°.
      const outward = ring.position.clone().normalize().multiplyScalar(0.32);
      const start = ring.position.clone().add(outward);
      const q = ring.quaternion
        .clone()
        .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (i % 2 ? 1 : -1) * 0.2));
      return {
        pos: [
          { value: start.x, velocity: 0 },
          { value: start.y, velocity: 0 },
          { value: start.z, velocity: 0 },
        ],
        quat: q,
        scale: { value: 0.92, velocity: 0 },
        glow: { value: 0, velocity: 0 },
        mark: { value: 0.18, velocity: 0 },
      };
    });
  }

  const nodeIndex = useMemo(() => {
    const map = new Map<string, number>();
    graph.nodes.forEach((n, i) => map.set(n.id, i));
    return map;
  }, [graph]);

  // Colores de aristas: dependen de la selección, no del cuadro.
  useEffect(() => {
    const mesh = edgesRef.current;
    if (!mesh) return;
    const sel = nodeIndex.get(selectedId);
    const bright = new THREE.Color(ACCENT);
    const dim = new THREE.Color(EDGE_DIM);
    graph.edges.forEach((e, i) => {
      const lit = sel !== undefined && (e.a === sel || e.b === sel);
      mesh.setColorAt(i, lit ? bright : dim);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    settled.current = false;
    invalidate();
  }, [selectedId, graph, nodeIndex, invalidate]);

  // Cualquier cambio discreto vuelve a pedir cuadros hasta asentar.
  useEffect(() => {
    settled.current = false;
    invalidate();
  }, [mode, hoveredId, selectedId, still, hidden, quality, invalidate]);

  const markLocal = useMemo(() => {
    const step = (Math.PI * 2) / CORE.pieces;
    const span = step - CORE.gap;
    const theta = -span / 2 + 0.16;
    return projects.map((_, i) => {
      const wave = CORE.axialWave * Math.sin(theta * 2 + (i * 0.9 + 0.4));
      return new THREE.Vector3(
        CORE.ringRadius * Math.cos(theta) - CORE.ringRadius,
        CORE.ringRadius * Math.sin(theta),
        wave + CORE.ribbonThickness / 2 + 0.006,
      );
    });
  }, []);

  useFrame((_, rawDt) => {
    const g = group.current;
    const st = state.current;
    if (!g || !st) return;
    const dt = Math.min(rawDt, 1 / 30);

    g.visible = !hidden;
    if (hidden) return;

    // Progreso anillo → grafo: un resorte compartido.
    const spreadTarget = mode === "core" ? 0 : 1;
    let moving = stepSpring(rig.spread, spreadTarget, dt, PIECE_SPRING);
    const spread = THREE.MathUtils.clamp(rig.spread.value, -0.2, 1.2);

    // Rotación del conjunto: inclinación base + giro del usuario + scroll.
    g.rotation.set(
      CORE.tiltX + rig.spin.x + rig.scroll * 0.14,
      CORE.tiltY + rig.spin.y,
      0,
    );
    const shrink = 1 - rig.scroll * 0.06;
    g.scale.setScalar(shrink);

    const selIndex = nodeIndex.get(selectedId);

    st.forEach((ps, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;
      const ring = ringPose(i);
      const node = graph.nodes[nodeIndex.get(projects[i].id) ?? i];
      const gp = graphPose(i, node.position);

      // Pose objetivo: interpolación entre anillo y grafo.
      tmpV.copy(ring.position).lerp(gp.position, spread);
      const isSelected = projects[i].id === selectedId;
      const isHovered = projects[i].id === hoveredId;
      if (isSelected && spread < 0.5) {
        // La pieza elegida se asoma del anillo.
        tmpV2.copy(ring.position).normalize().multiplyScalar(0.05 * (1 - spread * 2));
        tmpV.add(tmpV2);
      }
      tmpQ.copy(ring.quaternion).slerp(gp.quaternion, spread);
      const scaleTarget = THREE.MathUtils.lerp(1, gp.scale, spread) * (isHovered ? 1.03 : 1);

      if (still) {
        ps.pos[0].value = tmpV.x;
        ps.pos[1].value = tmpV.y;
        ps.pos[2].value = tmpV.z;
        ps.pos.forEach((s) => (s.velocity = 0));
        ps.quat.copy(tmpQ);
        ps.scale.value = scaleTarget;
        ps.scale.velocity = 0;
      } else {
        moving = stepSpring(ps.pos[0], tmpV.x, dt, PIECE_SPRING) || moving;
        moving = stepSpring(ps.pos[1], tmpV.y, dt, PIECE_SPRING) || moving;
        moving = stepSpring(ps.pos[2], tmpV.z, dt, PIECE_SPRING) || moving;
        moving = stepSpring(ps.scale, scaleTarget, dt, PIECE_SPRING) || moving;
        const before = ps.quat.angleTo(tmpQ);
        ps.quat.slerp(tmpQ, 1 - Math.exp(-9 * dt));
        if (before > 0.002) moving = true;
        else ps.quat.copy(tmpQ);
      }

      mesh.position.set(ps.pos[0].value, ps.pos[1].value, ps.pos[2].value);
      mesh.quaternion.copy(ps.quat);
      mesh.scale.setScalar(ps.scale.value);

      // Brillo: la pieza bajo el puntero sube; la seleccionada marca.
      const glowTarget = isHovered ? 0.18 : isSelected ? 0.035 : 0;
      const markTarget = isSelected ? 1 : isHovered ? 0.55 : 0.18;
      if (still) {
        ps.glow.value = glowTarget;
        ps.mark.value = markTarget;
      } else {
        moving = stepSpring(ps.glow, glowTarget, dt, { stiffness: 140, damping: 22, mass: 1 }) || moving;
        moving = stepSpring(ps.mark, markTarget, dt, { stiffness: 140, damping: 22, mass: 1 }) || moving;
      }
      const mat = materials[i];
      mat.emissiveIntensity = ps.glow.value;
      mat.roughness = 0.3 - ps.glow.value * 0.4;
      const mark = marks.current[i];
      if (mark) {
        markMaterials[i].opacity = ps.mark.value;
        mark.position.copy(mesh.position);
        mark.quaternion.copy(mesh.quaternion);
        mark.scale.setScalar(ps.scale.value);
        // La marca vive en la cara superior de su pieza.
        tmpV2.copy(markLocal[i]).multiplyScalar(ps.scale.value).applyQuaternion(mesh.quaternion);
        mark.position.add(tmpV2);
      }
    });

    // ── aristas ───────────────────────────────────────────────────
    const edges = edgesRef.current;
    if (edges) {
      const visible = spread > 0.02;
      edges.visible = visible;
      if (visible) {
        const asciiBoost = 1 + rig.ascii.value * 0.9;
        edgeMaterial.opacity = THREE.MathUtils.clamp((spread - 0.15) / 0.85, 0, 1) * 0.95;
        graph.edges.forEach((e, k) => {
          const a = meshes.current[e.a];
          const b = meshes.current[e.b];
          if (!a || !b) return;
          tmpV.subVectors(b.position, a.position);
          const len = tmpV.length();
          tmpV2.addVectors(a.position, b.position).multiplyScalar(0.5);
          tmpQ.setFromUnitVectors(UP, tmpV.normalize());
          const lit = selIndex !== undefined && (e.a === selIndex || e.b === selIndex);
          const radius = (0.011 + e.weight * 0.0035) * asciiBoost * (lit ? 1.4 : 1);
          tmpS.set(radius, Math.max(0.001, len - 0.25), radius);
          tmpM.compose(tmpV2, tmpQ, tmpS);
          edges.setMatrixAt(k, tmpM);
        });
        edges.instanceMatrix.needsUpdate = true;
        edgeMaterial.emissiveIntensity = 0.28 + rig.ascii.value * 0.9;
      }
    }

    if (moving || rig.dragging || Math.abs(rig.spin.vx) + Math.abs(rig.spin.vy) > 1e-4) {
      settled.current = false;
      sceneStats.invalidations.pieces += 1;
      invalidate();
    } else if (!settled.current) {
      settled.current = true;
      onSettle?.();
    }
  });

  const over = (id: string) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (rig.dragging) return;
    onHover(id);
  };
  const out = () => () => onHover(null);
  const click = (id: string) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    // Soltar después de arrastrar no selecciona.
    if (e.delta > 8) return;
    onSelect(id);
  };

  return (
    <group ref={group}>
      {projects.map((p, i) => (
        <mesh
          key={p.id}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          geometry={geometries[i]}
          material={materials[i]}
          onPointerOver={over(p.id)}
          onPointerOut={out()}
          onClick={click(p.id)}
        />
      ))}
      {projects.map((p, i) => (
        <mesh
          key={`${p.id}-mark`}
          ref={(el) => {
            marks.current[i] = el;
          }}
          geometry={markGeometry}
          material={markMaterials[i]}
          raycast={() => null}
        />
      ))}
      <instancedMesh
        ref={edgesRef}
        args={[edgeGeometry, edgeMaterial, Math.max(1, graph.edges.length)]}
        frustumCulled={false}
        raycast={() => null}
      />
    </group>
  );
}
