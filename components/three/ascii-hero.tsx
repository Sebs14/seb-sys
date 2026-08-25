"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AsciiPass } from "./ascii-pass";
import { ProjectGraph } from "./project-graph";
import { WebcamPlane, type CamState } from "./webcam-plane";
import { emit, on } from "@/lib/bus";
import { clsx } from "@/lib/clsx";
import { useLang } from "@/lib/i18n";

/* ══════════════════════════════════════════════════════════════
   HERO 3D ASCIIFICADO

   La geometría importa menos de lo que parece: lo que define el
   resultado es el RANGO de luminancia. Una forma plana da tres
   glifos distintos y se ve pobre. Por eso la iluminación es de
   contraste alto: barre la rampa entera de ' ' a '█'.
   ══════════════════════════════════════════════════════════════ */

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
  cellWidth = 6,
}: {
  className?: string;
  cellWidth?: number;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [frozen, setFrozen] = useState(false);
  /* El sistema puede quitarle el contexto WebGL a la pestaña en cualquier
     momento: GPU bajo presión, muchas pestañas con contexto, el equipo
     saliendo de suspensión. Sin manejarlo el hero se queda congelado para
     siempre y no hay forma de saber por qué. */
  const [lost, setLost] = useState(false);
  const retried = useRef(false);
  /** Rótulo del nodo bajo el puntero. Va en DOM: dentro del ASCII
      sería ilegible, y encima tiene que poder leerlo un lector de
      pantalla. */
  const [label, setLabel] = useState<string | null>(null);
  const [webcam, setWebcam] = useState(false);
  /* El bucle de WebGL corría a 60 fps para siempre: con el hero fuera
     de pantalla, con la pestaña en segundo plano, con la máquina en
     batería. Ahora sólo dibuja cuando de verdad se está viendo. */
  const [active, setActive] = useState(true);
  const boxRef = useRef<HTMLDivElement>(null);
  const [cam, setCam] = useState<CamState | null>(null);
  const { t } = useLang();

  useEffect(
    () =>
      on((e) => {
        if (e.type === "webcam") setWebcam(e.on);
      }),
    [],
  );

  /* Cada estado de la cámara se dice DOS veces: en el rótulo del hero
     (donde está mirando) y en la terminal (donde escribió el comando).
     Y si no hay cámara, se vuelve al grafo en vez de dejar un hueco. */
  const handleCam = useCallback(
    (state: CamState) => {
      setCam(state);
      // El mensaje va traducido, nunca el nombre interno del estado:
      // "cam: denied" es para el dev, no para quien está mirando.
      emit({ type: "notice", text: t(`cam.${state}` as "cam.live") });
      if (state === "denied" || state === "unsupported") setWebcam(false);
    },
    [t],
  );

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    let onScreen = true;
    const sync = () => setActive(onScreen && !document.hidden);

    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { rootMargin: "120px" },
    );
    observer.observe(box);
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

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

  if (supported === false || lost) return <StaticFallback className={className} />;

  return (
    <div ref={boxRef} className={clsx("relative", className)}>
      {supported && (
        <Canvas
          gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
          /* dpr 1 a propósito: la salida son glifos de 6 px, así que el
             doble de píxeles no agrega un solo detalle visible — pero
             cuadruplica los fragmentos que sombrea el quad de pantalla
             completa. Era el gasto más caro del hero, y gratuito. */
          dpr={1}
          frameloop={active ? "always" : "never"}
          camera={{ position: [0, 0, 4.6], fov: 45 }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", (event) => {
              // Sin preventDefault el navegador NUNCA intenta restaurar.
              event.preventDefault();
              setLost(true);
              // Un reintento y no más: si la GPU no está, insistir sólo
              // haría parpadear el hero entre arte estático y nada.
              if (!retried.current) {
                retried.current = true;
                window.setTimeout(() => setLost(false), 1200);
              }
            });
          }}
        >
          <Lights />
          {webcam ? (
            <WebcamPlane onState={handleCam} />
          ) : (
            <ProjectGraph frozen={frozen} onHover={setLabel} />
          )}
          <AsciiPass cellWidth={cellWidth} />
        </Canvas>
      )}

      {/* Rótulo: el nodo señalado, el estado de la cámara, o la pista. */}
      <p className="pointer-events-none absolute inset-x-[1ch] bottom-0 truncate text-term-green">
        {label ? (
          <>
            <span aria-hidden>{"▸ "}</span>
            {label}
          </>
        ) : webcam && cam ? (
          <span className={cam === "live" ? "text-term-green" : "text-term-amber"}>
            {t(`cam.${cam}` as "cam.live")}
          </span>
        ) : (
          <span className="text-term-green-deep">
            {webcam
              ? t("cam.asking")
              : "clic en un nodo ─ ficha en la terminal"}
          </span>
        )}
      </p>
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
