import * as THREE from "three";
import { CORE } from "@/lib/scene-config";

/* ══════════════════════════════════════════════════════════════
   GEOMETRÍA DEL NÚCLEO

   Siete arcos de aluminio alrededor de un anillo. Cada pieza es una
   sección redondeada (cinta de 0.30 × 0.12) barrida por un arco de
   2π/7 menos una junta, con una ondulación axial suave para que los
   reflejos revelen volumen. Se construye UNA vez por nivel de calidad
   y se reutiliza; nunca dentro del bucle.

   El origen local de cada pieza es el punto medio de su arco: así la
   misma geometría sirve para el anillo (posición + rotación θ) y para
   el grafo (posición del nodo + orientación común).
   ══════════════════════════════════════════════════════════════ */

export type ArcParams = {
  radius: number;
  /** ángulo total cubierto por la pieza, ya descontada la junta */
  span: number;
  width: number;
  thickness: number;
  cornerRadius: number;
  segments: number;
  /** puntos por cuarto de esquina (el perfil tiene 4·(n+1) puntos) */
  cornerPoints: number;
  waveAmp: number;
  wavePhase: number;
};

type Profile = { u: number; v: number; nu: number; nv: number }[];

/**
 * Perfil de rectángulo redondeado. Cada esquina se muestrea INCLUYENDO
 * sus dos extremos, así los puntos que abren y cierran cada lado plano
 * tienen la normal exacta de ese lado: las caras planas se sombrean
 * planas y las esquinas suaves. Con un solo anillo de puntos por
 * cuadrante las caras saldrían "hinchadas".
 */
function roundedProfile(w: number, h: number, r: number, n: number): Profile {
  const cx = w / 2 - r;
  const cy = h / 2 - r;
  const pts: Profile = [];
  const corners: [number, number, number][] = [
    [cx, cy, 0],
    [-cx, cy, Math.PI / 2],
    [-cx, -cy, Math.PI],
    [cx, -cy, (3 * Math.PI) / 2],
  ];
  corners.forEach(([ox, oy, a0]) => {
    for (let i = 0; i <= n; i += 1) {
      const a = a0 + (i / n) * (Math.PI / 2);
      const c = Math.cos(a);
      const s = Math.sin(a);
      pts.push({ u: ox + r * c, v: oy + r * s, nu: c, nv: s });
    }
  });
  return pts;
}

export function buildArcGeometry(p: ArcParams): THREE.BufferGeometry {
  const profile = roundedProfile(p.width, p.thickness, p.cornerRadius, p.cornerPoints);
  const P = profile.length;
  const S = p.segments;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const center = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const radial = new THREE.Vector3();
  const binormal = new THREE.Vector3();
  const tmp = new THREE.Vector3();

  const curve = (t: number, out: THREE.Vector3) => {
    const theta = (t - 0.5) * p.span;
    const wave = p.waveAmp * Math.sin(theta * 2 + p.wavePhase);
    out.set(p.radius * Math.cos(theta) - p.radius, p.radius * Math.sin(theta), wave);
    return out;
  };

  const rings: { pos: THREE.Vector3; nrm: THREE.Vector3 }[][] = [];

  for (let i = 0; i <= S; i += 1) {
    const t = i / S;
    curve(t, center);
    // Tangente por diferencias finitas: robusta ante la ondulación.
    curve(Math.min(1, t + 1e-3), tangent).sub(curve(Math.max(0, t - 1e-3), tmp)).normalize();
    const theta = (t - 0.5) * p.span;
    radial.set(Math.cos(theta), Math.sin(theta), 0);
    // Radial ortogonalizado contra la tangente.
    radial.addScaledVector(tangent, -radial.dot(tangent)).normalize();
    binormal.crossVectors(tangent, radial).normalize();

    const ring: { pos: THREE.Vector3; nrm: THREE.Vector3 }[] = [];
    profile.forEach((q) => {
      const pos = new THREE.Vector3()
        .copy(center)
        .addScaledVector(radial, q.u)
        .addScaledVector(binormal, q.v);
      const nrm = new THREE.Vector3()
        .addScaledVector(radial, q.nu)
        .addScaledVector(binormal, q.nv)
        .normalize();
      ring.push({ pos, nrm });
      positions.push(pos.x, pos.y, pos.z);
      normals.push(nrm.x, nrm.y, nrm.z);
      uvs.push(t * 4, ring.length / P);
    });
    rings.push(ring);
  }

  for (let i = 0; i < S; i += 1) {
    for (let j = 0; j < P; j += 1) {
      const a = i * P + j;
      const b = i * P + ((j + 1) % P);
      const c = (i + 1) * P + j;
      const d = (i + 1) * P + ((j + 1) % P);
      indices.push(a, c, b, b, c, d);
    }
  }

  // ── tapas ──────────────────────────────────────────────────────
  const addCap = (ringIndex: number, flip: boolean) => {
    const ring = rings[ringIndex];
    const t = ringIndex / S;
    curve(Math.min(1, t + 1e-3), tangent).sub(curve(Math.max(0, t - 1e-3), tmp)).normalize();
    if (flip) tangent.negate();
    const base = positions.length / 3;
    curve(t, center);
    positions.push(center.x, center.y, center.z);
    normals.push(tangent.x, tangent.y, tangent.z);
    uvs.push(0.5, 0.5);
    ring.forEach((q) => {
      positions.push(q.pos.x, q.pos.y, q.pos.z);
      normals.push(tangent.x, tangent.y, tangent.z);
      uvs.push(0.5, 0.5);
    });
    for (let j = 0; j < P; j += 1) {
      const a = base + 1 + j;
      const b = base + 1 + ((j + 1) % P);
      if (flip) indices.push(base, b, a);
      else indices.push(base, a, b);
    }
  };
  addCap(0, true);
  addCap(S, false);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeTangents();
  geometry.computeBoundingSphere();
  return geometry;
}

export type PieceParams = {
  segments: number;
  cornerPoints: number;
};

/** Las siete geometrías del anillo, con fase de ondulación distinta. */
export function buildPieces(q: PieceParams): THREE.BufferGeometry[] {
  const step = (Math.PI * 2) / CORE.pieces;
  if (typeof performance !== "undefined") performance.mark("seb:geometry-start");
  const pieces = Array.from({ length: CORE.pieces }, (_, i) =>
    buildArcGeometry({
      radius: CORE.ringRadius,
      span: step - CORE.gap,
      width: CORE.ribbonWidth,
      thickness: CORE.ribbonThickness,
      cornerRadius: 0.042,
      segments: q.segments,
      cornerPoints: q.cornerPoints,
      waveAmp: CORE.axialWave,
      // Fase distinta por pieza: la asimetría es controlada y determinista.
      wavePhase: i * 0.9 + 0.4,
    }),
  );
  if (typeof performance !== "undefined") performance.measure("seb:geometry", "seb:geometry-start");
  return pieces;
}

/** Pose de una pieza en el anillo (posición del punto medio + giro). */
export function ringPose(index: number): { position: THREE.Vector3; quaternion: THREE.Quaternion } {
  const step = (Math.PI * 2) / CORE.pieces;
  const theta = index * step + Math.PI / 2; // la primera pieza arriba
  const position = new THREE.Vector3(
    CORE.ringRadius * Math.cos(theta),
    CORE.ringRadius * Math.sin(theta),
    0,
  );
  const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), theta);
  return { position, quaternion };
}

/**
 * Pose de una pieza en el grafo: posición del nodo y una orientación
 * común (todas "sonríen" igual) con una leve inclinación determinista
 * para que los reflejos no sean idénticos.
 */
export function graphPose(
  index: number,
  node: [number, number, number],
): { position: THREE.Vector3; quaternion: THREE.Quaternion; scale: number } {
  const position = new THREE.Vector3(node[0], node[1], node[2]);
  // Las piezas miran a la cámara (arco horizontal, cara ancha visible) con
  // una leve inclinación distinta cada una para que los reflejos varíen.
  const tilt = new THREE.Euler(
    -0.35 + Math.sin(index * 1.7) * 0.18,
    Math.cos(index * 2.3) * 0.22,
    Math.sin(index * 0.9) * 0.16,
  );
  const quaternion = new THREE.Quaternion().setFromEuler(tilt);
  return { position, quaternion, scale: 0.78 };
}

/** Radio de la esfera que envuelve el conjunto, para encuadrar. */
export function boundingRadius(mode: "core" | "systems" | "ascii", graphRadius: number): number {
  if (mode === "systems" || mode === "ascii") {
    return graphRadius + CORE.ringRadius * 0.78 * 0.5 + 0.2;
  }
  return CORE.ringRadius + CORE.ribbonWidth / 2 + 0.12;
}
