"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "es" | "en";

/** Un valor que existe en ambos idiomas. */
export type Bi = { es: string; en: string };

/** Extrae el idioma activo de un par bilingüe. */
export function pick(value: Bi, lang: Lang): string {
  return value[lang];
}

/* ── strings de UI (chrome, no contenido) ─────────────────────── */
const UI = {
  "nav.home": { es: "inicio", en: "home" },
  "nav.about": { es: "sobre_mi", en: "about" },
  "nav.stack": { es: "stack", en: "stack" },
  "nav.work": { es: "proyectos", en: "work" },
  "nav.experience": { es: "experiencia", en: "experience" },
  "nav.contact": { es: "contacto", en: "contact" },

  "boot.title": { es: "INICIANDO SISTEMA", en: "BOOTING SYSTEM" },
  "boot.ready": { es: "SISTEMA LISTO", en: "SYSTEM READY" },
  "boot.skip": { es: "pulsá cualquier tecla para saltar", en: "press any key to skip" },

  "term.hint": { es: "pulsá ~ para la terminal", en: "press ~ for terminal" },
  "term.open": { es: "abrir terminal", en: "open terminal" },
  "term.close": { es: "cerrar", en: "close" },
  "term.unknown": { es: "comando no encontrado", en: "command not found" },
  "term.help": { es: "escribí `help` para ver los comandos", en: "type `help` for commands" },

  "a11y.decorative": {
    es: "Arte ASCII decorativo",
    en: "Decorative ASCII art",
  },
  "a11y.skip": {
    es: "Saltar al contenido principal",
    en: "Skip to main content",
  },

  "ui.scroll": { es: "DESPLAZAR", en: "SCROLL" },
  "ui.lang": { es: "IDIOMA", en: "LANG" },
  "ui.viewProject": { es: "ver proyecto", en: "view project" },
  "ui.source": { es: "código", en: "source" },
  "ui.live": { es: "en vivo", en: "live" },
  "ui.present": { es: "actual", en: "present" },
} as const satisfies Record<string, Bi>;

export type UIKey = keyof typeof UI;

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: UIKey) => string;
  /** Resuelve un par bilingüe con el idioma activo. */
  b: (value: Bi) => string;
};

const LangContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "seb.sys.lang";

export function LangProvider({
  children,
  initial = "es",
}: {
  children: ReactNode;
  initial?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initial);

  // Rehidratamos la preferencia después del montaje para no romper SSR.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "es" || stored === "en") {
      setLangState(stored);
      return;
    }
    // Sin preferencia guardada: seguimos al navegador.
    if (!navigator.language.toLowerCase().startsWith("es")) {
      setLangState("en");
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggleLang = useCallback(
    () => setLangState((prev) => (prev === "es" ? "en" : "es")),
    [],
  );

  const t = useCallback((key: UIKey) => UI[key][lang], [lang]);
  const b = useCallback((value: Bi) => value[lang], [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t, b }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang debe usarse dentro de <LangProvider>");
  return ctx;
}
