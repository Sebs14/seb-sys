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
import { carveRegions, facingSpin, fibonacciSphere, lcg, nearestSeed, randomDirection, REGION_SEEDS } from "@/lib/dot-sphere";
import type { Rig } from "./scene-rig";

/* ══════════════════════════════════════════════════════════════
   ESFERA DE PUNTOS — las siete regiones

   Núcleo: una esfera de puntos partida en siete regiones (una por
   proyecto) con una franja vacía entre ellas. Sistemas: cada región se
   contrae en un cúmulo y viaja a su nodo del grafo; las tecnologías
   compartidas se dibujan como líneas de puntos. Es el MISMO conjunto de
   puntos en los dos modos: el shader interpola entre la posición en la
   esfera y la del cúmulo con un solo resorte (`rig.spread`).

   Todo es punto: sin luces, sin entorno, sin metal. El tamaño se pide
   en unidades de escena y se convierte a píxeles del destino ACTUAL
   (`onBeforeRender`), así que el mismo material sirve para el canvas y
   para el render target diminuto del pase ASCII.

   Se toca la esfera entera: el punto bajo el puntero se lleva a la
   región más cercana. En Sistemas se tocan los cúmulos. Al elegir un
   proyecto, la esfera gira hasta mostrar su región de frente; esa es
   también la vista a la que vuelve "Restablecer".
   ══════════════════════════════════════════════════════════════ */

const BASE = "#a1a1a8";
const HOVER = "#f5f5f7";
const SELECTED = "#5b8cff";
const EDGE_DIM = "#4a4a52";

const DOT_VERT = /* glsl */ `
  uniform float uRadius;
  uniform float uCluster;
  uniform float uSpread;
  uniform float uIntro;
  uniform float uAscii;
  uniform float uViewH;
  uniform float uTanHalfFov;
  uniform float uSize;
  uniform vec3 uNodes[7];
  uniform float uSel[7];
  uniform float uHov[7];
  uniform vec3 uBase;
  uniform vec3 uHover;
  uniform vec3 uSelected;
  attribute vec3 aOffset;
  attribute float aOwner;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    int o = int(aOwner + 0.5);
    float sel = uSel[o];
    float hov = uHov[o];
    // La región elegida se asoma un poco de la esfera.
    vec3 onSphere = position * uRadius * (1.0 + 0.045 * sel + 0.015 * hov);
    vec3 inCluster = uNodes[o] + aOffset * uCluster;
    vec3 p = mix(onSphere, inCluster, uSpread);
    // Entrada: los puntos llegan desde afuera, escalonados.
    float k = clamp((uIntro - aSeed * 0.4) / 0.6, 0.0, 1.0);
    k = k * k * (3.0 - 2.0 * k);
    p *= mix(1.55, 1.0, k);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec3 n = normalize(normalMatrix * normalize(mix(position, aOffset, uSpread)));
    float facing = smoothstep(-0.5, 0.7, n.z);
    float size = uSize * (0.8 + 0.4 * aSeed) * (1.0 + 0.45 * sel + 0.25 * hov) * (1.0 + uAscii * 1.6);
    gl_PointSize = max(1.0, size * uViewH / (2.0 * uTanHalfFov * -mv.z));
    gl_Position = projectionMatrix * mv;
    vColor = mix(mix(uBase, uHover, hov), uSelected, sel);
    vAlpha = k * mix(0.13, 1.0, facing);
  }
`;

const DOT_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.3, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
    #include <colorspace_fragment>
  }
`;

const EDGE_VERT = /* glsl */ `
  uniform float uViewH;
  uniform float uTanHalfFov;
  uniform float uSize;
  uniform float uAscii;
  uniform float uAlpha;
  attribute vec3 aColor;
  attribute float aT;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = max(1.0, uSize * (1.0 + uAscii * 1.6) * uViewH / (2.0 * uTanHalfFov * -mv.z));
    gl_Position = projectionMatrix * mv;
    vColor = aColor;
    // Las puntas se apagan: la línea nace del borde del cúmulo, no del centro.
    vAlpha = uAlpha * smoothstep(0.08, 0.2, aT) * smoothstep(0.92, 0.8, aT);
  }
`;

const MARK_VERT = /* glsl */ `
  uniform float uViewH;
  uniform float uTanHalfFov;
  uniform float uSize;
  uniform float uSpread;
  uniform float uIntro;
  uniform float uSel[7];
  uniform float uHov[7];
  attribute float aIndex;
  attribute vec3 aDir;
  varying float vSel;
  varying float vHov;
  varying float vAlpha;
  varying float vPx;

  void main() {
    int i = int(aIndex + 0.5);
    vSel = uSel[i];
    vHov = uHov[i];
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * aDir);
    // En la esfera, las marcas de la cara de atrás se apagan antes de llegar al borde.
    float facing = mix(smoothstep(0.3, 0.65, n.z), 1.0, uSpread);
    gl_PointSize = max(1.0, uSize * (1.0 + 0.15 * vSel) * uViewH / (2.0 * uTanHalfFov * -mv.z));
    vPx = gl_PointSize;
    gl_Position = projectionMatrix * mv;
    vAlpha = facing * uIntro;
  }
`;

const MARK_FRAG = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uHover;
  uniform vec3 uSelected;
  varying float vSel;
  varying float vHov;
  varying float vAlpha;
  varying float vPx;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    // Grosor y centro en píxeles, no en proporción: el anillo es un
    // filete fino sea cual sea su tamaño.
    float px = 1.0 / vPx;
    float ring = 1.0 - smoothstep(1.0 * px, 2.2 * px, abs(d - (0.5 - 2.5 * px)));
    float core = (1.0 - smoothstep(3.5 * px, 5.0 * px, d)) * vSel;
    vec3 col = mix(mix(uBase, uHover, vHov), uSelected, vSel);
    float a = max(ring * mix(0.45, 1.0, max(vSel, vHov)), core) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;

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

const SEED_VECTORS = REGION_SEEDS.map((s) => new THREE.Vector3(...s));
const tmpV = new THREE.Vector3();
const drawSize = new THREE.Vector2();

/** Tamaño en píxeles del destino actual: canvas o render target ASCII. */
function trackViewport(material: THREE.ShaderMaterial) {
  return (renderer: THREE.WebGLRenderer) => {
    const target = renderer.getRenderTarget();
    material.uniforms.uViewH.value = target ? target.height : renderer.getDrawingBufferSize(drawSize).y;
  };
}

/** Radio de la esfera que envuelve el conjunto, para encuadrar. */
export function boundingRadius(mode: SceneMode, graphRadius: number): number {
  if (mode === "core") return CORE.radius * 1.06 + 0.1;
  return graphRadius + CORE.clusterRadius + 0.25;
}

export function DotSphere({
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
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const group = useRef<THREE.Group>(null);
  const hits = useRef<(THREE.Mesh | null)[]>([]);
  const settled = useRef(false);
  const cfg = SCENE_CONFIG[quality];

  // Región i ↔ projects[i]; su nodo en el grafo, por id.
  const graphPositions = useMemo(
    () =>
      projects.map((p) => {
        const node = graph.nodes.find((n) => n.id === p.id);
        return new THREE.Vector3(...(node?.position ?? [0, 0, 0]));
      }),
    [graph],
  );
  const edges = useMemo(
    () =>
      graph.edges.map((e) => ({
        a: projects.findIndex((p) => p.id === graph.nodes[e.a].id),
        b: projects.findIndex((p) => p.id === graph.nodes[e.b].id),
      })),
    [graph],
  );

  // ── geometrías: una vez por calidad ────────────────────────────
  const dotGeometry = useMemo(() => {
    const { points, owner } = carveRegions(fibonacciSphere(cfg.dots), REGION_SEEDS, CORE.gap);
    const rand = lcg(20261028);
    const n = points.length;
    const position = new Float32Array(n * 3);
    const offset = new Float32Array(n * 3);
    const own = new Float32Array(n);
    const seed = new Float32Array(n);
    points.forEach((p, i) => {
      position.set(p, i * 3);
      const d = randomDirection(rand);
      const r = 0.85 + 0.15 * rand();
      offset.set([d[0] * r, d[1] * r, d[2] * r], i * 3);
      own[i] = owner[i];
      seed[i] = rand();
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(position, 3));
    g.setAttribute("aOffset", new THREE.BufferAttribute(offset, 3));
    g.setAttribute("aOwner", new THREE.BufferAttribute(own, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [cfg.dots]);
  useEffect(() => () => dotGeometry.dispose(), [dotGeometry]);

  const edgeGeometry = useMemo(() => {
    const n = Math.max(1, edges.length * cfg.edgeDots);
    const g = new THREE.BufferGeometry();
    const position = new THREE.BufferAttribute(new Float32Array(n * 3), 3);
    position.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute("position", position);
    g.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const t = new Float32Array(n);
    for (let i = 0; i < n; i += 1) t[i] = (i % cfg.edgeDots) / (cfg.edgeDots - 1);
    g.setAttribute("aT", new THREE.BufferAttribute(t, 1));
    return g;
  }, [edges.length, cfg.edgeDots]);
  useEffect(() => () => edgeGeometry.dispose(), [edgeGeometry]);

  const markGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const position = new THREE.BufferAttribute(new Float32Array(projects.length * 3), 3);
    position.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute("position", position);
    g.setAttribute("aIndex", new THREE.BufferAttribute(Float32Array.from(projects, (_, i) => i), 1));
    g.setAttribute("aDir", new THREE.BufferAttribute(Float32Array.from(REGION_SEEDS.flat()), 3));
    return g;
  }, []);
  useEffect(() => () => markGeometry.dispose(), [markGeometry]);

  const hitGeometry = useMemo(() => new THREE.SphereGeometry(1, 24, 16), []);
  useEffect(() => () => hitGeometry.dispose(), [hitGeometry]);

  // ── materiales ────────────────────────────────────────────────
  const materials = useMemo(() => {
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const zeros = () => new Array(projects.length).fill(0);
    const sel = { value: zeros() };
    const hov = { value: zeros() };
    const common = { transparent: true, depthWrite: false };
    const dots = new THREE.ShaderMaterial({
      ...common,
      vertexShader: DOT_VERT,
      fragmentShader: DOT_FRAG,
      uniforms: {
        uRadius: { value: CORE.radius },
        uCluster: { value: CORE.clusterRadius },
        uSpread: { value: 0 },
        uIntro: { value: 0 },
        uAscii: { value: 0 },
        uViewH: { value: 1 },
        uTanHalfFov: { value: tan },
        uSize: { value: CORE.dotSize },
        uNodes: { value: projects.map(() => new THREE.Vector3()) },
        uSel: sel,
        uHov: hov,
        uBase: { value: new THREE.Color(BASE) },
        uHover: { value: new THREE.Color(HOVER) },
        uSelected: { value: new THREE.Color(SELECTED) },
      },
    });
    const edgeDots = new THREE.ShaderMaterial({
      ...common,
      vertexShader: EDGE_VERT,
      fragmentShader: DOT_FRAG,
      uniforms: {
        uViewH: { value: 1 },
        uTanHalfFov: { value: tan },
        uSize: { value: CORE.dotSize * 0.95 },
        uAscii: { value: 0 },
        uAlpha: { value: 0 },
      },
    });
    const marks = new THREE.ShaderMaterial({
      ...common,
      vertexShader: MARK_VERT,
      fragmentShader: MARK_FRAG,
      uniforms: {
        uViewH: { value: 1 },
        uTanHalfFov: { value: tan },
        uSize: { value: 0.12 },
        uSpread: { value: 0 },
        uIntro: { value: 0 },
        uSel: sel,
        uHov: hov,
        uBase: { value: new THREE.Color(BASE) },
        uHover: { value: new THREE.Color(HOVER) },
        uSelected: { value: new THREE.Color(SELECTED) },
      },
    });
    return { dots, edgeDots, marks };
  }, [camera]);
  useEffect(
    () => () => {
      materials.dots.dispose();
      materials.edgeDots.dispose();
      materials.marks.dispose();
    },
    [materials],
  );

  // ── estado animado (refs, nunca estado de React) ──────────────
  const anim = useRef<{ intro: Spring1D; sel: Spring1D[]; hov: Spring1D[]; lastSpread: number; lastSelected: string } | null>(null);
  if (anim.current === null) {
    anim.current = {
      intro: { value: 0, velocity: 0 },
      sel: projects.map(() => ({ value: 0, velocity: 0 })),
      hov: projects.map(() => ({ value: 0, velocity: 0 })),
      lastSpread: NaN,
      lastSelected: "",
    };
  }

  // Cualquier cambio discreto vuelve a pedir cuadros hasta asentar.
  useEffect(() => {
    settled.current = false;
    invalidate();
  }, [mode, hoveredId, selectedId, still, hidden, quality, invalidate]);

  // ── posiciones de nodos, aristas y marcas para un `spread` ────
  const nodeAt = (i: number, spread: number, out: THREE.Vector3) =>
    out.copy(SEED_VECTORS[i]).multiplyScalar(CORE.radius * 1.03).lerp(graphPositions[i], spread);

  const layoutGraph = (spread: number) => {
    const nodes = materials.dots.uniforms.uNodes.value as THREE.Vector3[];
    graphPositions.forEach((p, i) => nodes[i].copy(p));

    const marks = markGeometry.getAttribute("position") as THREE.BufferAttribute;
    projects.forEach((_, i) => {
      nodeAt(i, spread, tmpV);
      marks.setXYZ(i, tmpV.x, tmpV.y, tmpV.z);
    });
    marks.needsUpdate = true;

    const pos = edgeGeometry.getAttribute("position") as THREE.BufferAttribute;
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    edges.forEach((e, k) => {
      nodeAt(e.a, spread, a);
      nodeAt(e.b, spread, b);
      for (let j = 0; j < cfg.edgeDots; j += 1) {
        tmpV.copy(a).lerp(b, j / (cfg.edgeDots - 1));
        pos.setXYZ(k * cfg.edgeDots + j, tmpV.x, tmpV.y, tmpV.z);
      }
    });
    pos.needsUpdate = true;
  };

  const paintEdges = () => {
    const sel = projects.findIndex((p) => p.id === selectedId);
    const color = edgeGeometry.getAttribute("aColor") as THREE.BufferAttribute;
    const lit = new THREE.Color(SELECTED);
    const dim = new THREE.Color(EDGE_DIM);
    edges.forEach((e, k) => {
      const c = e.a === sel || e.b === sel ? lit : dim;
      for (let j = 0; j < cfg.edgeDots; j += 1) color.setXYZ(k * cfg.edgeDots + j, c.r, c.g, c.b);
    });
    color.needsUpdate = true;
  };

  useFrame((_, rawDt) => {
    const g = group.current;
    const st = anim.current;
    if (!g || !st) return;
    const dt = Math.min(rawDt, 1 / 30);

    g.visible = !hidden;
    if (hidden) return;

    // Progreso esfera → grafo: un resorte compartido.
    const spreadTarget = mode === "core" ? 0 : 1;
    let moving = false;
    if (still) {
      rig.spread.value = spreadTarget;
      rig.spread.velocity = 0;
      st.intro.value = 1;
    } else {
      moving = stepSpring(rig.spread, spreadTarget, dt, PIECE_SPRING) || moving;
      moving = stepSpring(st.intro, 1, dt, { stiffness: 60, damping: 14, mass: 1 }) || moving;
    }
    const spread = THREE.MathUtils.clamp(rig.spread.value, 0, 1);

    // Elegir un proyecto lleva su región al frente (por la vuelta más corta).
    if (selectedId !== st.lastSelected) {
      const index = Math.max(0, projects.findIndex((p) => p.id === selectedId));
      const home = facingSpin(REGION_SEEDS[index], { x: CORE.tiltX, y: CORE.tiltY }, CORE.maxTilt);
      const turn = Math.PI * 2;
      home.y += turn * Math.round((rig.spin.y - home.y) / turn);
      rig.home = home;
      if (st.lastSelected === "" || still) {
        rig.spin.x = home.x;
        rig.spin.y = home.y;
        rig.spin.vx = rig.spin.vy = 0;
      } else if (mode === "core" && !rig.dragging) {
        rig.resetRequested = true;
      }
      paintEdges();
      st.lastSelected = selectedId;
      moving = true;
    }

    // Rotación del conjunto: inclinación base + giro del usuario + scroll.
    g.rotation.set(CORE.tiltX + rig.spin.x + rig.scroll * 0.14, CORE.tiltY + rig.spin.y, 0);
    g.scale.setScalar(1 - rig.scroll * 0.06);

    // Elegida y bajo el puntero: un resorte por región.
    projects.forEach((p, i) => {
      const selTarget = p.id === selectedId ? 1 : 0;
      const hovTarget = p.id === hoveredId ? 1 : 0;
      if (still) {
        st.sel[i].value = selTarget;
        st.hov[i].value = hovTarget;
        st.sel[i].velocity = st.hov[i].velocity = 0;
      } else {
        const glow = { stiffness: 140, damping: 22, mass: 1 };
        moving = stepSpring(st.sel[i], selTarget, dt, glow) || moving;
        moving = stepSpring(st.hov[i], hovTarget, dt, glow) || moving;
      }
      const sel = materials.dots.uniforms.uSel.value as number[];
      const hov = materials.dots.uniforms.uHov.value as number[];
      sel[i] = THREE.MathUtils.clamp(st.sel[i].value, 0, 1);
      hov[i] = THREE.MathUtils.clamp(st.hov[i].value, 0, 1);
    });

    if (spread !== st.lastSpread) {
      layoutGraph(spread);
      st.lastSpread = spread;
    }

    const intro = THREE.MathUtils.clamp(st.intro.value, 0, 1);
    const ascii = THREE.MathUtils.clamp(rig.ascii.value, 0, 1);
    const u = materials.dots.uniforms;
    u.uSpread.value = spread;
    u.uIntro.value = intro;
    u.uAscii.value = ascii;
    materials.edgeDots.uniforms.uAscii.value = ascii;
    materials.edgeDots.uniforms.uAlpha.value = THREE.MathUtils.smoothstep(spread, 0.25, 1) * 0.9;
    materials.marks.uniforms.uSpread.value = spread;
    materials.marks.uniforms.uIntro.value = intro;
    materials.marks.uniforms.uSize.value = THREE.MathUtils.lerp(0.12, CORE.clusterRadius * 2.7, spread);

    // Zonas de toque de los cúmulos: siguen a los nodos.
    hits.current.forEach((mesh, i) => {
      if (!mesh) return;
      nodeAt(i, spread, mesh.position);
      mesh.scale.setScalar(CORE.clusterRadius * 1.35);
    });

    if (moving || rig.dragging || Math.abs(rig.spin.vx) + Math.abs(rig.spin.vy) > 1e-4) {
      settled.current = false;
      sceneStats.invalidations.pieces += 1;
      invalidate();
    } else if (!settled.current) {
      settled.current = true;
      onSettle?.();
    }
  });

  // ── toque ─────────────────────────────────────────────────────
  // En Núcleo responde la esfera entera; en Sistemas, los cúmulos.
  const sphereRaycast = useMemo(
    () =>
      function (this: THREE.Mesh, raycaster: THREE.Raycaster, intersects: THREE.Intersection[]) {
        if (rig.spread.value < 0.5) THREE.Mesh.prototype.raycast.call(this, raycaster, intersects);
      },
    [rig],
  );
  const clusterRaycast = useMemo(
    () =>
      function (this: THREE.Mesh, raycaster: THREE.Raycaster, intersects: THREE.Intersection[]) {
        if (rig.spread.value >= 0.5) THREE.Mesh.prototype.raycast.call(this, raycaster, intersects);
      },
    [rig],
  );

  const regionAt = (e: ThreeEvent<PointerEvent | MouseEvent>) => {
    const g = group.current;
    if (!g) return null;
    const local = g.worldToLocal(e.point.clone()).normalize();
    return projects[nearestSeed([local.x, local.y, local.z], REGION_SEEDS)].id;
  };
  const hoverSphere = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (rig.dragging) return;
    const id = regionAt(e);
    if (id && id !== hoveredId) onHover(id);
  };
  const clickSphere = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    // Soltar después de arrastrar no selecciona.
    if (e.delta > 8) return;
    const id = regionAt(e);
    if (id) onSelect(id);
  };
  const over = (id: string) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (rig.dragging) return;
    onHover(id);
  };
  const click = (id: string) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 8) return;
    onSelect(id);
  };

  const viewport = useMemo(
    () => ({
      dots: trackViewport(materials.dots),
      edges: trackViewport(materials.edgeDots),
      marks: trackViewport(materials.marks),
    }),
    [materials],
  );

  return (
    <group ref={group}>
      <points
        geometry={dotGeometry}
        material={materials.dots}
        frustumCulled={false}
        onBeforeRender={viewport.dots}
        raycast={() => null}
      />
      <points
        geometry={edgeGeometry}
        material={materials.edgeDots}
        frustumCulled={false}
        onBeforeRender={viewport.edges}
        raycast={() => null}
      />
      <points
        geometry={markGeometry}
        material={materials.marks}
        frustumCulled={false}
        onBeforeRender={viewport.marks}
        raycast={() => null}
      />
      <mesh
        geometry={hitGeometry}
        scale={CORE.radius * 1.06}
        visible={false}
        raycast={sphereRaycast}
        onPointerMove={hoverSphere}
        onPointerOut={() => onHover(null)}
        onClick={clickSphere}
      />
      {projects.map((p, i) => (
        <mesh
          key={p.id}
          ref={(el) => {
            hits.current[i] = el;
          }}
          geometry={hitGeometry}
          visible={false}
          raycast={clusterRaycast}
          onPointerOver={over(p.id)}
          onPointerOut={() => onHover(null)}
          onClick={click(p.id)}
        />
      ))}
    </group>
  );
}
