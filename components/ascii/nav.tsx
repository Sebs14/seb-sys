"use client";

import { useEffect, useState } from "react";
import { useLang, type UIKey } from "@/lib/i18n";
import { identity } from "@/lib/content";
import { Shade } from "./frame";
import { clsx } from "@/lib/clsx";

/* ══════════════════════════════════════════════════════════════
   BARRA DE NAVEGACIÓN

   Sticky, con la sección activa marcada por IntersectionObserver.
   La marca no es un subrayado: es el paréntesis del prompt —
   `[sobre_mi]` cuando está activa, ` sobre_mi ` cuando no. En una
   interfaz de caracteres el estado se dice con caracteres.
   ══════════════════════════════════════════════════════════════ */

const LINKS: { id: string; key: UIKey }[] = [
  { id: "about", key: "nav.about" },
  { id: "work", key: "nav.work" },
  { id: "stack", key: "nav.stack" },
  { id: "experience", key: "nav.experience" },
  { id: "contact", key: "nav.contact" },
];

export function Nav() {
  const { lang, toggleLang, t } = useLang();
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const targets = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => !!el,
    );
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // La sección activa es la más cercana al tope de las visibles:
        // con dos secciones en pantalla gana la de arriba, que es la
        // que el usuario está leyendo.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActive(visible[0].target.id);
          return;
        }
        // Nada en la banda y estamos arriba: el hero no es una sección,
        // así que no debe quedar ninguna entrada marcada.
        if (window.scrollY < 200) setActive("");
      },
      // El margen inferior descarta lo que apenas asoma abajo.
      { rootMargin: "-15% 0px -55% 0px", threshold: 0 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="sticky top-0 z-50 -mx-[2ch] bg-term-bg/85 px-[2ch] backdrop-blur-[2px]">
      {/* En angosto la navegación baja a su propia línea: apretarla en la
          misma fila recortaba la última entrada. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-[2ch] py-[calc(var(--lh)/2)] text-term-green-dim">
        <a href="#main" className="shrink-0 whitespace-nowrap hover:text-term-green">
          <Shade className="text-term-green-deep" /> {identity.handle}@seb.sys
        </a>

        <nav
          aria-label={t("nav.home")}
          className="order-3 -ml-[1ch] w-full min-w-0 text-left md:order-none md:ml-0 md:w-auto md:flex-1 md:overflow-x-auto md:whitespace-nowrap md:text-right md:[scrollbar-width:none]"
        >
          {LINKS.map(({ id, key }) => {
            const on = active === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                aria-current={on ? "true" : undefined}
                className={clsx(
                  "ml-[1ch] inline-block",
                  on ? "glow text-term-green" : "hover:text-term-green",
                )}
              >
                <span aria-hidden>{on ? "[" : " "}</span>
                {t(key)}
                <span aria-hidden>{on ? "]" : " "}</span>
              </a>
            );
          })}
        </nav>

        <button
          onClick={toggleLang}
          className="shrink-0 cursor-pointer whitespace-nowrap text-term-green hover:glow-strong"
        >
          [{t("ui.lang")}: {lang.toUpperCase()}]
        </button>
      </div>
    </div>
  );
}
