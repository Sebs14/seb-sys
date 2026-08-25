"use client";

import { useEffect, useState } from "react";
import { on } from "@/lib/bus";
import { useLang } from "@/lib/i18n";

/* ══════════════════════════════════════════════════════════════
   poweroff

   Si el sitio finge ser un monitor, el monitor tiene que poder
   apagarse. Y un CRT no se apaga con un fundido: la imagen se
   colapsa a una línea horizontal, la línea se apaga, y queda el
   fósforo brillando un instante.

   Cualquier tecla o clic lo vuelve a encender.
   ══════════════════════════════════════════════════════════════ */

export function Poweroff() {
  const { t } = useLang();
  const [off, setOff] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(
    () =>
      on((e) => {
        if (e.type === "poweroff") setOff(true);
      }),
    [],
  );

  useEffect(() => {
    if (!off) return;

    // El colapso arranca un cuadro después de montar, para que la
    // transición tenga un estado inicial del que salir.
    const start = window.setTimeout(() => setCollapsed(true), 30);

    const revive = () => {
      setCollapsed(false);
      setOff(false);
    };
    // Se enciende sola en el próximo tick de interacción, no antes:
    // si no, el propio Enter del comando la apagaría y prendería.
    const arm = window.setTimeout(() => {
      window.addEventListener("keydown", revive, { once: true });
      window.addEventListener("pointerdown", revive, { once: true });
    }, 400);

    return () => {
      window.clearTimeout(start);
      window.clearTimeout(arm);
      window.removeEventListener("keydown", revive);
      window.removeEventListener("pointerdown", revive);
    };
  }, [off]);

  if (!off) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black">
      {/* La imagen colapsando a una línea: escala en Y, no opacidad. */}
      <div
        className="absolute inset-x-0 top-1/2 origin-center bg-term-green transition-all duration-500 ease-in"
        style={{
          height: collapsed ? "2px" : "100vh",
          marginTop: collapsed ? "-1px" : "-50vh",
          opacity: collapsed ? 0.12 : 0.06,
        }}
      />
      <p className="absolute inset-x-0 bottom-[var(--lh)] text-center text-term-green-deep">
        {t("power.back")}
      </p>
    </div>
  );
}
