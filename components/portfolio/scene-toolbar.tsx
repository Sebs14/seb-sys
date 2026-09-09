"use client";

import { usePortfolio } from "./portfolio-state";
import { useLang } from "@/lib/i18n";
import { useMotionPreference } from "@/lib/use-motion-preference";
import { SCENE_MODES, type SceneMode } from "@/lib/scene-types";
import type { SceneApi } from "@/components/three/portfolio-scene";

/* Selector Núcleo / Sistemas / ASCII + Pausar + Restablecer. Grupo de
   botones con aria-pressed: sin tabs a medias. La caja de layout es la
   misma en todos los estados. */
export function SceneToolbar({ apiRef }: { apiRef: React.RefObject<SceneApi | null> }) {
  const { t } = useLang();
  const { mode, setMode, webcamOn, setWebcamOn, webcamStatus, setWebcamStatus } = usePortfolio();
  const { paused, reduced, setPaused } = useMotionPreference();

  const pick = (next: SceneMode) => {
    if (webcamOn) setWebcamOn(false);
    // Un aviso viejo de la cámara no debe quedar pegado al cambiar de modo.
    if (webcamStatus !== "inactive") setWebcamStatus("inactive");
    setMode(next);
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <div className="segmented" role="group" aria-label={t("scene.modes")}>
        {SCENE_MODES.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m && !webcamOn}
            onClick={() => pick(m)}
          >
            {t(`scene.mode.${m}` as "scene.mode.core")}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
          disabled={reduced}
          title={reduced ? t("lab.reduced") : undefined}
        >
          <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            {paused ? <path d="M7 5l12 7-12 7z" /> : (
              <>
                <path d="M8 5v14" />
                <path d="M16 5v14" />
              </>
            )}
          </svg>
          {paused ? t("scene.resume") : t("scene.pause")}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => apiRef.current?.resetView()}>
          <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 4v5h5" />
          </svg>
          {t("scene.reset")}
        </button>
      </div>

      <p className="t-small basis-full text-ink-3" role="status">
        {webcamStatus !== "inactive"
          ? t(`cam.${webcamStatus}` as "cam.live")
          : mode === "core"
            ? t("scene.hint")
            : t("scene.hintSystems")}
      </p>
      {webcamOn && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setWebcamOn(false)}>
          {t("cam.stop")}
        </button>
      )}
    </div>
  );
}
