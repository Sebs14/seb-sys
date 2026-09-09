"use client";

import { useEffect, useState } from "react";
import { on, type RecreationalEffect } from "@/lib/bus";
import { useLang } from "@/lib/i18n";
import { Cat } from "./cat";
import { Matrix } from "./matrix";
import { Train } from "./train";
import { VimTrap } from "./vim-trap";
import { Screensaver } from "./screensaver";
import { Poweroff } from "./poweroff";
import { Starfield } from "./starfield";
import { VHold } from "./vhold";

/* ══════════════════════════════════════════════════════════════
   ANFITRIÓN DE EFECTOS

   Un solo efecto que cubra la pantalla a la vez: activar uno cancela
   y limpia el anterior. Nada se enciende solo. El gato y el modo CRT
   (estrellas, scanlines, desgarro) son capas que conviven con la
   lectura y también se piden a mano.
   ══════════════════════════════════════════════════════════════ */

export function EffectsHost() {
  const { t } = useLang();
  const [effect, setEffect] = useState<RecreationalEffect | null>(null);
  const [crt, setCrt] = useState(false);

  useEffect(
    () =>
      on((e) => {
        if (e.type === "effect") setEffect(e.name);
        if (e.type === "crt") setCrt(e.on);
      }),
    [],
  );

  const done = () => setEffect(null);

  return (
    <>
      <Cat />
      {crt && (
        <>
          <Starfield />
          <VHold />
          <div className="crt-overlay" aria-hidden />
        </>
      )}
      {effect === "matrix" && <Matrix onDone={done} closeLabel={t("effect.close")} />}
      {effect === "train" && <Train onDone={done} closeLabel={t("effect.close")} />}
      {effect === "vim" && <VimTrap onDone={done} />}
      {effect === "screensaver" && <Screensaver onDone={done} closeLabel={t("effect.close")} />}
      {effect === "poweroff" && <Poweroff onDone={done} />}
    </>
  );
}
