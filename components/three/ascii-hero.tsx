"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AsciiPass } from "./ascii-pass";
import { clsx } from "@/lib/clsx";

/* ══════════════════════════════════════════════════════════════
   HERO 3D ASCIIFICADO

   La geometría importa menos de lo que parece: lo que define el
   resultado es el RANGO de luminancia. Una forma plana da tres
   glifos distintos y se ve pobre. Por eso la iluminación es de
   contraste alto: barre la rampa entera de ' ' a '█'.
   ══════════════════════════════════════════════════════════════ */

function Knot({ frozen }: { frozen: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const mesh = ref.current;
    if (!mesh || frozen) return;

    mesh.rotation.x += delta * 0.17;
    mesh.rotation.y += delta * 0.24;

    // El puntero inclina la figura en vez de rotarla: se siente como
    // mirar un objeto, no como arrastrarlo.
    const { x, y } = state.pointer;
    mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, x * 0.35, 0.04);
    mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, y * 0.25, 0.04);
  });

  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[1.05, 0.33, 190, 28]} />
      <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.05} />
    </mesh>
  );
}

function Lights() {
  return (
    <>
      {/* Ambiente muy bajo: define el piso de la rampa (los ' ' y '.'). */}
      <ambientLight intensity={0.18} />
      {/* Key alta y dura: produce los '@' y '█'. */}
      <directionalLight position={[3, 4, 5]} intensity={2.6} />
      {/* Rim opuesta: despega la silueta del fondo. */}
      <pointLight position={[-4, -2, 2]} intensity={18} distance={14} />
    </>
  );
}

export function AsciiHero({
  className,
  cellWidth = 8,
}: {
  className?: string;
  cellWidth?: number;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [frozen, setFrozen] = useState(false);

  useEffect(() => {
    // Detección de WebGL: si no hay, no montamos el Canvas siquiera.
    try {
      const probe = document.createElement("canvas");
      setSupported(
        !!(probe.getContext("webgl2") || probe.getContext("webgl")),
      );
    } catch {
      setSupported(false);
    }

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setFrozen(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (supported === false) return <StaticFallback className={className} />;

  return (
    <div className={clsx("relative", className)} aria-hidden>
      {supported && (
        <Canvas
          gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
          dpr={[1, 2]}
          camera={{ position: [0, 0, 4.6], fov: 45 }}
        >
          <Lights />
          <Knot frozen={frozen} />
          <AsciiPass cellWidth={cellWidth} />
        </Canvas>
      )}
    </div>
  );
}

/** Sin WebGL el hero no puede quedar vacío: mostramos arte estático. */
function StaticFallback({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={clsx(
        "ascii-art flex items-center justify-center text-term-green-dim",
        className,
      )}
    >
      {String.raw`
      .:-=+*#%@%#*+=-:.
   .-+*#%@@@@@@@@@@%#*+-.
  :*%@@@@%#*+==+*#%@@@@%*:
 -%@@@%*-.        .-*%@@@%-
:@@@@*.      ..      .*@@@@:
*@@@%.   .:=+**+=:.   .%@@@*
%@@@:   -*%@@@@@@%*-   :@@@%
*@@@%.   .:=+**+=:.   .%@@@*
:@@@@*.      ..      .*@@@@:
 -%@@@%*-.        .-*%@@@%-
  :*%@@@@%#*+==+*#%@@@@%*:
   .-+*#%@@@@@@@@@@%#*+-.
      .:-=+*#%@%#*+=-:.
`}
    </div>
  );
}
