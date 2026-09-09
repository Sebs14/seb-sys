"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePortfolio } from "@/components/portfolio/portfolio-state";
import { useLang } from "@/lib/i18n";
import { emit } from "@/lib/bus";
import { useMotionPreference } from "@/lib/use-motion-preference";
import { SCENE_CONFIG, CAMERA, initialTier } from "@/lib/scene-config";
import { sceneStats } from "@/lib/scene-stats";
import type { QualityTier } from "@/lib/scene-types";
import { PIECE_SPRING, stepSpring } from "@/lib/spring";
import { CoreAssembly } from "./core-assembly";
import { SceneControls } from "./scene-controls";
import { StudioEnvironment } from "./studio-environment";
import { AsciiPass } from "./ascii-pass";
import { WebcamPlane } from "./webcam-plane";
import { createRig, type Rig } from "./scene-rig";

/* ══════════════════════════════════════════════════════════════
   ESCENA DEL PORTAFOLIO — el Canvas y la composición de modos

   Una sola instancia WebGL. Núcleo, Sistemas y ASCII son estados del
   mismo objeto: las piezas viajan (CoreAssembly), el pase ASCII se
   mezcla encima (AsciiPass) y la cámara reencuadra (SceneControls).

   Render a demanda: cada parte pide cuadros mientras algo se mueve y
   deja de pedirlos al asentar. Fuera de pantalla o con la pestaña
   oculta, `frameloop="never"`.
   ══════════════════════════════════════════════════════════════ */

export type SceneApi = {
  invalidate: () => void;
  resetView: () => void;
  setScroll: (progress: number) => void;
};

type Props = {
  active: boolean;
  onGl: (gl: THREE.WebGLRenderer) => void;
  onFirstFrame: () => void;
  onApi: (api: SceneApi | null) => void;
  onDragChange: (dragging: boolean) => void;
};

const MAX_TIER_CHANGES = 2;
const TIERS: QualityTier[] = ["high", "medium", "low"];

const ASCII_COLORS = {
  green: { dim: "#1f4a30", mid: "#9ef5b5", hot: "#f5f6f7", bg: "#090b0d" },
  amber: { dim: "#4d3411", mid: "#ffd28b", hot: "#fff4e0", bg: "#090b0d" },
};

function usePhosphor(): "green" | "amber" {
  const [phosphor, setPhosphor] = useState<"green" | "amber">("green");
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setPhosphor(root.dataset.phosphor === "amber" ? "amber" : "green");
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-phosphor"] });
    return () => observer.disconnect();
  }, []);
  return phosphor;
}

export default function PortfolioScene({ active, onGl, onFirstFrame, onApi, onDragChange }: Props) {
  const [tier, setTier] = useState<QualityTier>(() => initialTier());
  const rigRef = useRef<Rig | null>(null);
  if (rigRef.current === null) rigRef.current = createRig();
  const rig = rigRef.current;
  const cfg = SCENE_CONFIG[tier];

  const tierChanges = useRef(0);
  const lowerTier = useCallback(() => {
    if (tierChanges.current >= MAX_TIER_CHANGES) return;
    setTier((current) => {
      const next = TIERS[Math.min(TIERS.length - 1, TIERS.indexOf(current) + 1)];
      if (next !== current) tierChanges.current += 1;
      return next;
    });
  }, []);

  return (
    <Canvas
      frameloop={active ? "demand" : "never"}
      dpr={[1, cfg.dpr]}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
      }}
      camera={{ fov: CAMERA.fov, position: CAMERA.position, near: 0.1, far: 40 }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.info.autoReset = false;
        onGl(gl);
      }}
    >
      <SceneBody
        rig={rig}
        tier={tier}
        active={active}
        onFirstFrame={onFirstFrame}
        onApi={onApi}
        onDragChange={onDragChange}
        onSlow={lowerTier}
      />
    </Canvas>
  );
}

function SceneBody({
  rig,
  tier,
  active,
  onFirstFrame,
  onApi,
  onDragChange,
  onSlow,
}: {
  rig: Rig;
  tier: QualityTier;
  active: boolean;
  onFirstFrame: () => void;
  onApi: (api: SceneApi | null) => void;
  onDragChange: (dragging: boolean) => void;
  onSlow: () => void;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const gl = useThree((s) => s.gl);
  const {
    mode,
    selectedId,
    hoveredId,
    setHovered,
    select,
    webcamOn,
    setWebcamStatus,
    setWebcamOn,
    graph,
  } = usePortfolio();
  const { still } = useMotionPreference();
  const { t } = useLang();
  const phosphor = usePhosphor();
  const cfg = SCENE_CONFIG[tier];
  const asciiRef = useRef(0);
  const firstFrame = useRef(false);

  // ── API hacia el shell ────────────────────────────────────────
  useEffect(() => {
    onApi({
      invalidate: () => invalidate(),
      resetView: () => {
        rig.resetRequested = true;
        invalidate();
      },
      setScroll: (p) => {
        if (Math.abs(rig.scroll - p) > 0.002) {
          rig.scroll = p;
          invalidate();
        }
      },
    });
    return () => onApi(null);
  }, [onApi, invalidate, rig]);

  // Al volver a estar activo, un cuadro para revalidar tamaño y estado.
  useEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);

  useEffect(() => {
    sceneStats.mode = mode;
    sceneStats.quality = tier;
    sceneStats.frameloop = active ? "demand" : "never";
    rig.lastInteraction = performance.now();
    invalidate();
  }, [mode, tier, active, invalidate, rig]);

  useEffect(() => {
    rig.lastInteraction = performance.now();
  }, [hoveredId, selectedId, webcamOn, rig]);

  const graphRadius = useMemo(
    () => Math.max(...graph.nodes.map((n) => Math.hypot(...n.position))),
    [graph],
  );

  const asciiActive = mode === "ascii" || webcamOn;

  // ── mezcla ASCII, estadísticas y monitor de rendimiento ──────
  const slowFrames = useRef(0);
  const lastSlowChange = useRef(0);
  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const target = asciiActive ? 1 : 0;
    let moving: boolean;
    if (still) {
      rig.ascii.value = target;
      rig.ascii.velocity = 0;
      moving = false;
    } else {
      moving = stepSpring(rig.ascii, target, dt, { ...PIECE_SPRING, stiffness: 110, damping: 21 });
    }
    asciiRef.current = THREE.MathUtils.clamp(rig.ascii.value, 0, 1);
    if (moving) {
      sceneStats.invalidations.blend += 1;
      invalidate();
    }
  }, 0);

  useFrame((state, rawDt) => {
    // Corre después del render (prioridad 2): lee lo que se dibujó.
    sceneStats.frames += 1;
    sceneStats.lastFrameAt = performance.now();
    sceneStats.drawCalls = gl.info.render.calls;
    sceneStats.triangles = gl.info.render.triangles;
    sceneStats.textures = gl.info.memory.textures;
    sceneStats.geometries = gl.info.memory.geometries;
    sceneStats.dpr = gl.getPixelRatio();
    gl.info.reset();

    if (!firstFrame.current) {
      firstFrame.current = true;
      performance.mark("seb:first-frame");
      onFirstFrame();
    }

    // Monitor: sólo cuenta cuadros consecutivos lentos durante animación.
    if (rawDt > 1 / 38 && rawDt < 1) slowFrames.current += 1;
    else slowFrames.current = Math.max(0, slowFrames.current - 2);
    const now = state.clock.elapsedTime;
    if (slowFrames.current > 40 && now - lastSlowChange.current > 8) {
      slowFrames.current = 0;
      lastSlowChange.current = now;
      onSlow();
    }
  }, 2);

  const onSettle = useCallback(() => {
    // Nada que hacer: sin invalidate, el bucle a demanda se detiene solo.
  }, []);

  const handleCam = useCallback(
    (status: Parameters<typeof setWebcamStatus>[0]) => {
      setWebcamStatus(status);
      // El estado se dice también en la terminal, donde pudo escribirse el comando.
      if (status !== "inactive") emit({ type: "notice", text: t(`cam.${status}` as "cam.live") });
      if (status === "denied" || status === "unsupported" || status === "error") {
        // La cámara se apaga pero el aviso queda visible hasta la próxima acción.
        setWebcamOn(false);
        setWebcamStatus(status);
      }
    },
    [setWebcamStatus, setWebcamOn, t],
  );

  return (
    <>
      <StudioEnvironment resolution={cfg.envResolution} />
      <CoreAssembly
        rig={rig}
        quality={tier}
        mode={mode}
        selectedId={selectedId}
        hoveredId={hoveredId}
        onHover={setHovered}
        onSelect={select}
        still={still}
        hidden={webcamOn}
        graph={graph}
        onSettle={onSettle}
      />
      <SceneControls
        rig={rig}
        mode={mode}
        graphRadius={graphRadius}
        still={still}
        onDragChange={onDragChange}
      />
      {webcamOn && <WebcamPlane onState={handleCam} />}
      <AsciiPass
        blendRef={asciiRef}
        cellWidth={cfg.asciiCell}
        animate={!still && asciiActive}
        // El parpadeo de luminancia sólo vive unos segundos tras la
        // última interacción; después la escena ASCII reposa a demanda.
        // Con la cámara encendida el video ya pide sus propios cuadros.
        animateUntilRef={{ get current() { return webcamOn ? Infinity : rig.lastInteraction + 4000; } }}
        colors={ASCII_COLORS[phosphor]}
      />
    </>
  );
}
