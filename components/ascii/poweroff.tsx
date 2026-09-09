"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { motionIsStill } from "@/lib/use-motion-preference";

/* poweroff: la imagen colapsa a una línea y queda el fósforo. Cualquier
   tecla, toque o el botón lo vuelve a encender. */

export function Poweroff({ onDone }: { onDone: () => void }) {
  const { t } = useLang();
  const [collapsed, setCollapsed] = useState(motionIsStill());

  useEffect(() => {
    const start = window.setTimeout(() => setCollapsed(true), 30);
    const arm = window.setTimeout(() => {
      window.addEventListener("keydown", onDone, { once: true });
      window.addEventListener("pointerdown", onDone, { once: true });
    }, 400);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(arm);
      window.removeEventListener("keydown", onDone);
      window.removeEventListener("pointerdown", onDone);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[110] bg-black" role="dialog" aria-label="poweroff">
      <div
        className="absolute inset-x-0 top-1/2 origin-center bg-phosphor transition-all duration-500 ease-in"
        style={{
          height: collapsed ? "2px" : "100vh",
          marginTop: collapsed ? "-1px" : "-50vh",
          opacity: collapsed ? 0.14 : 0.06,
        }}
      />
      <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3">
        <p className="t-small text-ink-3">{t("power.back")}</p>
        <button type="button" onClick={onDone} className="btn btn-secondary btn-sm">
          {t("power.on")}
        </button>
      </div>
    </div>
  );
}
