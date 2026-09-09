"use client";

import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type * as THREE from "three";
import { usePortfolio } from "@/components/portfolio/portfolio-state";
import { useLang } from "@/lib/i18n";
import { clsx } from "@/lib/clsx";
import { createStore, useStoreValue } from "@/lib/preference-store";
import { projects } from "@/lib/content";
import type { SceneStatus } from "@/lib/scene-types";
import { sceneStats } from "@/lib/scene-stats";
import { SceneFallback } from "./scene-fallback";
import type { SceneApi } from "./portfolio-scene";

/* ══════════════════════════════════════════════════════════════
   SHELL DE LA ESCENA — contenedor estable, capacidad y recuperación

   El contenedor al que se asocian el observador de visibilidad y las
   medidas NUNCA se desmonta. Lo que cambia es su interior: escena,
   fallback o mensaje. Estados explícitos: loading, ready, unsupported,
   recovering, failed.

   Pérdida de contexto: `preventDefault`, fallback en la misma caja, un
   reintento automático (remontando el Canvas) y, si vuelve a fallar,
   botón "Reintentar 3D". Cada handler está atado a un renderer
   concreto: una recuperación vieja no toca una instancia nueva.
   ══════════════════════════════════════════════════════════════ */

const PortfolioScene = dynamic(() => import("./portfolio-scene"), { ssr: false });

/* Capacidad: WebGL 2 real, comprobado una vez y con el contexto de
   prueba liberado. El probe es una pista, no una garantía: si el
   renderer falla al crearse, el límite de errores de abajo lo atrapa. */
const capability = createStore<"unknown" | "yes" | "no">("unknown");
let probed = false;
function probeWebGL2() {
  if (probed || typeof document === "undefined") return;
  probed = true;
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("webgl2");
    if (!ctx) {
      capability.set("no");
      return;
    }
    ctx.getExtension("WEBGL_lose_context")?.loseContext();
    capability.set("yes");
  } catch {
    capability.set("no");
  }
}
const capabilityStore = {
  get: () => {
    probeWebGL2();
    return capability.get();
  },
  set: capability.set,
  subscribe: capability.subscribe,
};

class SceneErrorBoundary extends Component<
  { onError: () => void; resetKey: number; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  componentDidUpdate(prev: { resetKey: number }) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function SceneShell({
  className,
  apiRef,
}: {
  className?: string;
  /** el hero lo usa para Restablecer vista */
  apiRef?: React.RefObject<SceneApi | null>;
}) {
  const { t } = useLang();
  const { selectedId, hoveredId } = usePortfolio();
  const supported = useStoreValue(capabilityStore, "unknown");

  const boxRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<SceneStatus>("loading");
  const [canvasKey, setCanvasKey] = useState(0);
  const [active, setActive] = useState(true);
  const [dragging, setDragging] = useState(false);
  /* La GPU no compite con el texto: el Canvas se monta cuando la página
     ya cargó y el hilo principal está libre (o a los 600 ms, lo que
     llegue antes). El fallback ocupa la caja mientras tanto. */
  const [deferred, setDeferred] = useState(false);
  useEffect(() => {
    let idle: number | null = null;
    let timer: number | null = null;
    const go = () => setDeferred(true);
    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(go, { timeout: 600 });
      } else {
        timer = window.setTimeout(go, 200);
      }
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (idle !== null && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, []);
  const autoRetried = useRef(false);
  const retryTimer = useRef<number | null>(null);
  const internalApi = useRef<SceneApi | null>(null);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);

  const unsupported = supported === "no";

  // ── visibilidad: fuera de pantalla u oculto no se dibuja ───────
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

  // ── scroll del hero: inclinación leve y reversible ─────────────
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const rect = box.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
      internalApi.current?.setScroll(progress);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    sceneStats.status = unsupported ? "unsupported" : status;
  }, [status, unsupported]);

  useEffect(
    () => () => {
      if (retryTimer.current) window.clearTimeout(retryTimer.current);
    },
    [],
  );

  const remount = useCallback(() => {
    internalApi.current = null;
    glRef.current = null;
    setStatus("loading");
    setCanvasKey((k) => k + 1);
  }, []);

  const onGl = useCallback(
    (gl: THREE.WebGLRenderer) => {
      glRef.current = gl;
      const canvas = gl.domElement;
      const onLost = (event: Event) => {
        // Sin preventDefault el navegador NUNCA intenta restaurar.
        event.preventDefault();
        if (glRef.current !== gl) return; // una instancia vieja no manda
        setStatus("recovering");
        if (retryTimer.current) window.clearTimeout(retryTimer.current);
        if (!autoRetried.current) {
          autoRetried.current = true;
          retryTimer.current = window.setTimeout(() => {
            retryTimer.current = null;
            if (glRef.current === gl) remount();
          }, 1200);
        } else {
          setStatus("failed");
        }
      };
      canvas.addEventListener("webglcontextlost", onLost);
      // No hay desmontaje explícito del listener: el canvas muere con el
      // renderer que lo creó, y el guard `glRef.current !== gl` anula
      // cualquier evento tardío de una instancia anterior.
    },
    [remount],
  );

  const onFirstFrame = useCallback(() => {
    setStatus("ready");
  }, []);

  const onApi = useCallback(
    (api: SceneApi | null) => {
      internalApi.current = api;
      if (apiRef) apiRef.current = api;
    },
    [apiRef],
  );

  const onError = useCallback(() => {
    setStatus("failed");
  }, []);

  const retry = () => {
    // Un reintento manual siempre está permitido.
    remount();
  };

  const showCanvas = deferred && !unsupported && status !== "failed";
  const message =
    unsupported
      ? t("scene.unsupported")
      : status === "recovering"
        ? t("scene.recovering")
        : status === "failed"
          ? t("scene.failed")
          : null;

  const selectedIndex = Math.max(0, projects.findIndex((p) => p.id === selectedId));
  const hovered = projects.find((p) => p.id === hoveredId);

  return (
    <div
      ref={boxRef}
      className={clsx("scene-box", className)}
      data-status={unsupported ? "unsupported" : status}
      data-dragging={dragging || undefined}
      role="group"
      aria-label={t("scene.label")}
    >
      {/* El fallback está siempre en la caja: fija la altura y cubre
          carga, sin WebGL, recuperación y fallo. Se desvanece al estar listo. */}
      <div
        aria-hidden={status === "ready" && !unsupported}
        className={clsx(
          "absolute inset-0 flex items-center justify-center p-[8%] transition-opacity duration-500",
          status === "ready" && !unsupported ? "opacity-0" : "opacity-100",
        )}
      >
        <SceneFallback label={t("scene.fallbackAlt")} selectedIndex={selectedIndex} />
      </div>

      {showCanvas && (
        <SceneErrorBoundary onError={onError} resetKey={canvasKey}>
          <PortfolioScene
            key={canvasKey}
            active={active}
            onGl={onGl}
            onFirstFrame={onFirstFrame}
            onApi={onApi}
            onDragChange={setDragging}
          />
        </SceneErrorBoundary>
      )}

      {/* Rótulo de la pieza bajo el puntero: HTML, legible y anunciable. */}
      <p
        className="pointer-events-none absolute left-4 top-4 t-meta rounded-full px-3 py-1.5 text-ink-2 transition-opacity duration-150"
        style={{ background: "rgb(9 11 13 / 0.6)", opacity: hovered ? 1 : 0 }}
        aria-live="polite"
      >
        {hovered?.name ?? " "}
      </p>

      {message && (
        <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl glass px-4 py-3">
          <p className="t-small text-ink-2" role="status">
            {message}
          </p>
          {status === "failed" && !unsupported && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={retry}>
              {t("scene.retry")}
            </button>
          )}
        </div>
      )}

    </div>
  );
}
