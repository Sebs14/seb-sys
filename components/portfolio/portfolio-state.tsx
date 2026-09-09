"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { emit, on } from "@/lib/bus";
import { projects } from "@/lib/content";
import { buildGraph, type ProjectGraph } from "@/lib/project-graph";
import type { SceneMode, WebcamStatus } from "@/lib/scene-types";

/* ══════════════════════════════════════════════════════════════
   ESTADO DEL PORTAFOLIO

   Una sola fuente de verdad para lo que comparten la escena, los
   controles HTML y la ficha: modo, proyecto seleccionado, proyecto
   bajo el puntero y cámara. La terminal (que vive fuera de este árbol)
   habla con esto por el bus.

   Lo que cambia por cuadro (rotaciones, resortes) NO está acá: vive en
   refs dentro de la escena. Esto sólo comunica cambios discretos.
   ══════════════════════════════════════════════════════════════ */

export const DEFAULT_PROJECT_ID = "fluidez-lectora";

type PortfolioState = {
  mode: SceneMode;
  setMode: (mode: SceneMode) => void;
  selectedId: string;
  select: (id: string) => void;
  hoveredId: string | null;
  setHovered: (id: string | null) => void;
  /** Abre el detalle en la lista, lo enfoca y desplaza hasta él. */
  openProject: (id: string) => void;
  webcamOn: boolean;
  setWebcamOn: (on: boolean) => void;
  webcamStatus: WebcamStatus;
  setWebcamStatus: (status: WebcamStatus) => void;
  graph: ProjectGraph;
};

const Ctx = createContext<PortfolioState | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<SceneMode>("core");
  const [selectedId, setSelectedId] = useState(DEFAULT_PROJECT_ID);
  const [hoveredId, setHovered] = useState<string | null>(null);
  const [webcamOn, setWebcamOnState] = useState(false);
  const [webcamStatus, setWebcamStatus] = useState<WebcamStatus>("inactive");

  const graph = useMemo(() => buildGraph(projects), []);

  const select = useCallback((id: string) => {
    if (projects.some((p) => p.id === id)) setSelectedId(id);
  }, []);

  const setMode = useCallback((next: SceneMode) => setModeState(next), []);

  const setWebcamOn = useCallback((onNext: boolean) => {
    setWebcamOnState(onNext);
    // Al apagarla a mano se limpia el aviso; un fallo (denied/error) lo
    // deja puesto para que se lea, y el siguiente cambio de modo lo borra.
    if (!onNext) setWebcamStatus((s) => (s === "live" || s === "asking" ? "inactive" : s));
  }, []);

  const openProject = useCallback(
    (id: string) => {
      select(id);
      emit({ type: "open-project", id });
    },
    [select],
  );

  // El bus es la entrada de la terminal y del laboratorio.
  useEffect(
    () =>
      on((e) => {
        if (e.type === "select-project") select(e.id);
        if (e.type === "scene-mode") setModeState(e.mode);
        if (e.type === "webcam") setWebcamOn(e.on);
      }),
    [select, setWebcamOn],
  );

  const value = useMemo<PortfolioState>(
    () => ({
      mode,
      setMode,
      selectedId,
      select,
      hoveredId,
      setHovered,
      openProject,
      webcamOn,
      setWebcamOn,
      webcamStatus,
      setWebcamStatus,
      graph,
    }),
    [mode, setMode, selectedId, select, hoveredId, openProject, webcamOn, setWebcamOn, webcamStatus, graph],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePortfolio(): PortfolioState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePortfolio debe usarse dentro de <PortfolioProvider>");
  return ctx;
}
