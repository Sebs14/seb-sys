"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLang, type UIKey } from "@/lib/i18n";
import { clsx } from "@/lib/clsx";
import { emit } from "@/lib/bus";

/* ══════════════════════════════════════════════════════════════
   NAVEGACIÓN

   Una píldora translúcida centrada (la única capa con blur junto con
   la terminal). Escritorio: marca, enlaces, idioma, terminal y
   Contacto, separados por filetes. Móvil: la barra ocupa el ancho con
   marca, idioma y Menú; el menú es un disclosure no modal que empuja
   el contenido, se cierra con Escape y devuelve el foco.
   La sección activa se marca con `aria-current` y un texto oculto.
   ══════════════════════════════════════════════════════════════ */

const LINKS: { id: string; key: UIKey }[] = [
  { id: "work", key: "nav.work" },
  { id: "about", key: "nav.about" },
  { id: "experience", key: "nav.experience" },
  { id: "lab", key: "nav.lab" },
];

export function PortfolioNav() {
  const { lang, toggleLang, t } = useLang();
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ids = [...LINKS.map((l) => l.id), "explore", "contact", "stack"];
    // La portada también se observa: al volver a ella no queda nada marcado.
    const targets = [document.querySelector<HTMLElement>(".hero"), ...ids.map((id) => document.getElementById(id))]
      .filter((el): el is HTMLElement => !!el);
    if (!targets.length) return;
    // El stack vive dentro de Enfoque; el escenario, dentro de Proyectos.
    const parent: Record<string, string> = { stack: "about", explore: "work" };
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = visible[0].target.id;
          setActive(parent[id] ?? id);
          return;
        }
        if (window.scrollY < 200) setActive("");
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Escape cierra el menú y devuelve el foco al botón.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const link = (id: string, key: UIKey, extra?: string) => {
    const on = active === id;
    return (
      <a
        key={id}
        href={`#${id}`}
        className={clsx("nav-link", extra)}
        aria-current={on ? "true" : undefined}
        onClick={() => setOpen(false)}
      >
        {t(key)}
        {on && <span className="sr-only"> ({t("nav.current")})</span>}
      </a>
    );
  };

  return (
    <header className="sticky top-0 z-50 pt-3 md:pt-4">
      <div className="container-x">
        <div className="glass nav-bar flex-wrap !h-auto rounded-[16px] md:flex-nowrap">
          <div className="flex h-[var(--nav-height)] w-full items-center gap-0.5 md:w-auto">
            <a
              href="#main"
              className="nav-link mr-auto gap-2 !px-2.5 font-semibold tracking-tight text-ink md:mr-0"
              aria-label="seb.sys — inicio"
            >
              <LogoMark />
              seb.sys
            </a>

            <span aria-hidden className="nav-sep hidden md:block" />

            <nav aria-label={t("nav.label")} className="hidden items-center gap-0.5 md:flex">
              {LINKS.map((l) => link(l.id, l.key))}
            </nav>

            <span aria-hidden className="nav-sep hidden md:block" />

            <button
              type="button"
              onClick={toggleLang}
              className="nav-link t-meta uppercase"
              aria-label={`${t("nav.lang")}: ${lang.toUpperCase()}. ${t("nav.langTo")}`}
            >
              {lang === "es" ? "ES" : "EN"}
              <span aria-hidden className="mx-1 text-ink-3">
                /
              </span>
              <span aria-hidden className="text-ink-3">
                {lang === "es" ? "EN" : "ES"}
              </span>
            </button>

            <button
              type="button"
              className="icon-btn hidden md:inline-grid"
              aria-label={t("term.open")}
              onClick={() => emit({ type: "terminal", open: true })}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 17l6-5-6-5" />
                <path d="M12 19h8" />
              </svg>
            </button>

            <a href="#contact" className="btn btn-primary ml-1 hidden !min-h-9 !rounded-[9px] !px-3.5 !text-[0.875rem] md:inline-flex">
              {t("nav.contact")}
            </a>

            <button
              ref={menuButton}
              type="button"
              className="icon-btn md:hidden"
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? t("nav.closeMenu") : t("nav.menu")}
              onClick={() => setOpen((v) => !v)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
                {open ? (
                  <>
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </>
                ) : (
                  <>
                    <path d="M4 8h16" />
                    <path d="M4 16h16" />
                  </>
                )}
              </svg>
            </button>
          </div>

          <div id={menuId} hidden={!open} className="w-full md:hidden">
            <nav aria-label={t("nav.menu")} className="flex flex-col gap-1 border-t border-stroke px-1 py-3">
              {LINKS.map((l) => link(l.id, l.key, "min-h-12 text-[1.0625rem]"))}
              {link("contact", "nav.contact", "min-h-12 text-[1.0625rem]")}
              <button
                type="button"
                className="nav-link min-h-12 text-left text-[1.0625rem]"
                onClick={() => {
                  setOpen(false);
                  emit({ type: "terminal", open: true });
                }}
              >
                {t("term.open")}
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

/* La marca: siete puntos en círculo, uno por región de la esfera; el
   último en el acento. Coordenadas redondeadas: el servidor y el
   navegador tienen que escribir el mismo SVG. */
const MARK_DOTS = Array.from({ length: 7 }, (_, i) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / 7;
  return { cx: (32 + 20 * Math.cos(a)).toFixed(2), cy: (32 + 20 * Math.sin(a)).toFixed(2) };
});

function LogoMark() {
  return (
    <svg aria-hidden width="18" height="18" viewBox="0 0 64 64">
      {MARK_DOTS.map((d, i) => (
        <circle
          key={i}
          cx={d.cx}
          cy={d.cy}
          r="6.5"
          fill={i === MARK_DOTS.length - 1 ? "var(--color-accent)" : "currentColor"}
          opacity={i === MARK_DOTS.length - 1 ? 1 : 0.55 + (i % 3) * 0.15}
        />
      ))}
    </svg>
  );
}
