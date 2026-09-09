"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLang, type UIKey } from "@/lib/i18n";
import { clsx } from "@/lib/clsx";
import { emit } from "@/lib/bus";

/* ══════════════════════════════════════════════════════════════
   NAVEGACIÓN

   Barra flotante translúcida (la única capa con blur junto con la
   terminal). Escritorio: marca, tres enlaces, idioma y Contacto.
   Móvil: marca, idioma y Menú; el menú es un disclosure no modal que
   empuja el contenido, se cierra con Escape y devuelve el foco.
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
    const ids = [...LINKS.map((l) => l.id), "contact", "stack"];
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!targets.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = visible[0].target.id;
          // El stack vive dentro de Enfoque en la navegación.
          setActive(id === "stack" ? "about" : id);
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
    <header className="sticky top-0 z-50 pt-4 md:pt-6">
      <div className="container-x">
        <div className="glass rounded-[var(--radius-panel)] px-2 sm:px-3">
          <div className="flex h-[var(--nav-height)] items-center gap-1">
            <a
              href="#main"
              className="nav-link mr-auto pl-3 font-semibold tracking-tight text-ink"
              aria-label="seb.sys — inicio"
            >
              <span aria-hidden className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-accent" />
              seb.sys
            </a>

            <nav aria-label={t("nav.label")} className="hidden items-center gap-1 md:flex">
              {LINKS.map((l) => link(l.id, l.key))}
            </nav>

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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 17l6-5-6-5" />
                <path d="M12 19h8" />
              </svg>
            </button>

            <a href="#contact" className="btn btn-primary btn-sm hidden md:inline-flex">
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
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </>
                )}
              </svg>
            </button>
          </div>

          <div id={menuId} hidden={!open} className="md:hidden">
            <nav aria-label={t("nav.menu")} className="flex flex-col gap-1 border-t border-stroke py-3">
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
