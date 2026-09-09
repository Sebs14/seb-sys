"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { emit, on } from "@/lib/bus";
import { useMotionPreference } from "@/lib/use-motion-preference";
import { usePortfolio } from "./portfolio-state";
import { HELP } from "@/lib/terminal/commands";
import { SectionHeader } from "./section-header";

/* ══════════════════════════════════════════════════════════════
   LABORATORIO

   La parte rara, a la vista y bajo control: nada se enciende solo.
   Abrir terminal, probar ASCII, usar cámara, ver comandos, modo CRT y
   el gato. Cada acción es un botón real con estado.
   ══════════════════════════════════════════════════════════════ */

export function Playground() {
  const { t } = useLang();
  const { setMode, setWebcamOn, webcamOn } = usePortfolio();
  const { reduced } = useMotionPreference();
  const [crt, setCrt] = useState(false);
  const [cat, setCat] = useState(false);
  const [showCommands, setShowCommands] = useState(false);

  useEffect(
    () =>
      on((e) => {
        if (e.type === "cat") setCat(e.on);
        if (e.type === "crt") setCrt(e.on);
      }),
    [],
  );

  const goTop = () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });

  return (
    <section id="lab" className="section-y bg-section" aria-labelledby="lab-title">
      <div className="container-x">
        <SectionHeader id="lab-title" eyebrow={t("nav.lab")} title={t("lab.title")} lead={t("lab.lead")} />
        {reduced && <p className="t-small mb-6 text-amber">{t("lab.reduced")}</p>}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <LabCard
            title={t("lab.terminal")}
            body={t("lab.terminalBody")}
            action={t("lab.terminal")}
            onClick={() => emit({ type: "terminal", open: true })}
          />
          <LabCard
            title={t("lab.ascii")}
            body={t("lab.asciiBody")}
            action={t("lab.ascii")}
            onClick={() => {
              setMode("ascii");
              goTop();
            }}
          />
          <LabCard
            title={webcamOn ? t("cam.stop") : t("lab.camera")}
            body={t("lab.cameraBody")}
            action={webcamOn ? t("cam.stop") : t("lab.camera")}
            pressed={webcamOn}
            onClick={() => {
              const next = !webcamOn;
              emit({ type: "webcam", on: next });
              if (next) {
                setWebcamOn(true);
                goTop();
              }
            }}
          />
          <LabCard
            title={t("lab.crt")}
            body={t("lab.crtHint")}
            action={t("lab.crt")}
            pressed={crt}
            onClick={() => emit({ type: "crt", on: !crt })}
          />
          <LabCard
            title={cat ? t("lab.catOff") : t("lab.cat")}
            body={t("lab.catBody")}
            action={cat ? t("lab.catOff") : t("lab.cat")}
            pressed={cat}
            onClick={() => emit({ type: "cat", on: !cat })}
          />
          <LabCard
            title={t("lab.commands")}
            body={t("lab.commandsBody")}
            action={t("lab.commands")}
            pressed={showCommands}
            onClick={() => setShowCommands((v) => !v)}
            controls="lab-commands"
          />
        </div>

        <div id="lab-commands" className="disclosure" data-open={showCommands}>
          <div>
            <dl className="terminal mt-6 grid gap-x-8 gap-y-2 rounded-[var(--radius-panel)] border border-stroke bg-base p-6 sm:grid-cols-2">
              {HELP.map((h) => (
                <div key={h.cmd} className="flex gap-4">
                  <dt className="shrink-0 text-phosphor">{h.cmd}</dt>
                  <dd className="text-ink-3">{t(h.key)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function LabCard({
  title,
  body,
  action,
  onClick,
  pressed,
  controls,
}: {
  title: string;
  body: string;
  action: string;
  onClick: () => void;
  pressed?: boolean;
  controls?: string;
}) {
  return (
    <div className="panel flex flex-col p-5">
      <h3 className="t-body font-semibold text-ink">{title}</h3>
      <p className="t-small mt-2 flex-1 text-ink-3">{body}</p>
      <button
        type="button"
        className="btn btn-secondary btn-sm mt-5 self-start"
        onClick={onClick}
        aria-pressed={pressed}
        aria-controls={controls}
        aria-expanded={controls ? pressed : undefined}
      >
        {action}
      </button>
    </div>
  );
}
