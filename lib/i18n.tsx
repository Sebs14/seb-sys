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

  "term.title": { es: "TERMINAL", en: "TERMINAL" },
  "term.boot": {
    es: "seb.sys — escribí `help` para ver los comandos",
    en: "seb.sys — type `help` to list commands",
  },
  "term.usage": { es: "uso", en: "usage" },
  "term.noSection": { es: "no existe esa sección", en: "no such section" },
  "term.noProject": { es: "no existe ese proyecto", en: "no such project" },
  "term.going": { es: "voy a", en: "going to" },
  "term.sections": { es: "secciones", en: "sections" },
  "term.projects": { es: "proyectos", en: "projects" },
  "term.catOn": { es: "hay un gato en tu portafolio", en: "there is a cat in your portfolio" },
  "term.catOff": { es: "el gato se fue", en: "the cat left" },
  "term.sudo": {
    es: "este usuario no está en el archivo de sudoers. el incidente será reportado.",
    en: "this user is not in the sudoers file. this incident will be reported.",
  },
  "term.rm": { es: "buen intento.", en: "nice try." },
  "term.measuring": { es: "midiendo…", en: "measuring…" },
  "vim.hint": {
    es: "escribí :q! como todos",
    en: "type :q! like everyone else",
  },
  "vim.nowrite": {
    es: "E37: no guardaste los cambios (agregá ! para forzar)",
    en: "E37: no write since last change (add ! to override)",
  },
  "power.back": { es: "pulsá cualquier tecla", en: "press any key" },
  "term.webcamOn": {
    es: "cámara → glifos. nada sale de tu navegador. `webcam off` para salir",
    en: "camera → glyphs. nothing leaves your browser. `webcam off` to exit",
  },
  "term.webcamOff": { es: "cámara apagada", en: "camera off" },
  "cam.asking": {
    es: "pidiendo permiso de cámara… si no ves el aviso, mirá la barra de direcciones",
    en: "asking for camera permission… if you see no prompt, check the address bar",
  },
  "cam.live": { es: "cámara en vivo", en: "camera live" },
  "cam.denied": {
    es: "no diste permiso de cámara (o el navegador lo bloqueó). volviendo al grafo",
    en: "camera permission denied (or blocked by the browser). back to the graph",
  },
  "cam.unsupported": {
    es: "este navegador no expone la cámara acá: hace falta https o localhost",
    en: "this browser exposes no camera here: https or localhost is required",
  },

  "cmd.help": { es: "esta lista", en: "this list" },
  "cmd.ls": { es: "lista secciones y proyectos", en: "list sections and projects" },
  "cmd.cd": { es: "salta a una sección", en: "jump to a section" },
  "cmd.open": { es: "abre un proyecto por su número", en: "open a project by number" },
  "cmd.cat": { es: "muestra un archivo… o un gato", en: "print a file… or a cat" },
  "cmd.whoami": { es: "quién soy", en: "who I am" },
  "cmd.neofetch": { es: "ficha del sistema", en: "system card" },
  "cmd.lang": { es: "cambia el idioma", en: "switch language" },
  "cmd.matrix": { es: "no preguntes", en: "don't ask" },
  "cmd.webcam": { es: "verte a vos mismo en ASCII", en: "see yourself in ASCII" },
  "cmd.coffee": { es: "café", en: "coffee" },
  "cmd.htop": { es: "qué está haciendo esta página", en: "what this page is doing" },
  "cmd.theme": { es: "fósforo verde o ámbar", en: "green or amber phosphor" },
  "cmd.vim": { es: "abrí vim. suerte saliendo", en: "open vim. good luck leaving" },
  "cmd.poweroff": { es: "apagá el monitor", en: "turn the monitor off" },
  "cmd.clear": { es: "limpia la pantalla", en: "clear the screen" },
  "cmd.exit": { es: "cierra la terminal", en: "close the terminal" },

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
