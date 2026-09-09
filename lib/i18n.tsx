"use client";

import { createContext, useCallback, useContext, useEffect, type ReactNode } from "react";
import { createStore, readStorage, useStoreValue, writeStorage } from "./preference-store";

export type Lang = "es" | "en";

/** Un valor que existe en ambos idiomas. */
export type Bi = { es: string; en: string };

/** Extrae el idioma activo de un par bilingüe. */
export function pick(value: Bi, lang: Lang): string {
  return value[lang];
}

/* ── strings de UI (chrome, no contenido) ─────────────────────── */
const UI = {
  "nav.home": { es: "Inicio", en: "Home" },
  "nav.work": { es: "Proyectos", en: "Work" },
  "nav.about": { es: "Enfoque", en: "Approach" },
  "nav.stack": { es: "Stack", en: "Stack" },
  "nav.experience": { es: "Experiencia", en: "Experience" },
  "nav.lab": { es: "Laboratorio", en: "Lab" },
  "nav.contact": { es: "Contacto", en: "Contact" },
  "nav.menu": { es: "Menú", en: "Menu" },
  "nav.closeMenu": { es: "Cerrar menú", en: "Close menu" },
  "nav.label": { es: "Navegación principal", en: "Main navigation" },
  "nav.current": { es: "sección actual", en: "current section" },
  "nav.lang": { es: "Idioma", en: "Language" },
  "nav.langTo": { es: "Switch to English", en: "Cambiar a español" },

  "hero.viewProjects": { es: "Ver proyectos", en: "View projects" },
  "hero.contact": { es: "Contactarme", en: "Get in touch" },

  "scene.label": {
    es: "Escultura interactiva de siete piezas de aluminio, una por proyecto",
    en: "Interactive sculpture of seven aluminium pieces, one per project",
  },
  "scene.modes": { es: "Presentación de la escena", en: "Scene presentation" },
  "scene.mode.core": { es: "Núcleo", en: "Core" },
  "scene.mode.systems": { es: "Sistemas", en: "Systems" },
  "scene.mode.ascii": { es: "ASCII", en: "ASCII" },
  "scene.pause": { es: "Pausar movimiento", en: "Pause motion" },
  "scene.resume": { es: "Reanudar movimiento", en: "Resume motion" },
  "scene.reset": { es: "Restablecer vista", en: "Reset view" },
  "scene.hint": {
    es: "Arrastrá para girar. Tocá una pieza para elegir un proyecto.",
    en: "Drag to rotate. Tap a piece to pick a project.",
  },
  "scene.hintSystems": {
    es: "Cada línea es una tecnología compartida entre dos proyectos.",
    en: "Every line is a technology shared by two projects.",
  },
  "scene.loading": { es: "Cargando la escena…", en: "Loading the scene…" },
  "scene.unsupported": {
    es: "Este navegador no tiene WebGL 2. La escultura se muestra como imagen; la lista de proyectos funciona igual.",
    en: "This browser has no WebGL 2. The sculpture is shown as an image; the project list works the same.",
  },
  "scene.recovering": {
    es: "El navegador soltó la GPU. Recuperando la escena…",
    en: "The browser dropped the GPU. Recovering the scene…",
  },
  "scene.failed": {
    es: "La escena 3D no pudo recuperarse. El contenido sigue disponible.",
    en: "The 3D scene could not recover. The content is still available.",
  },
  "scene.retry": { es: "Reintentar 3D", en: "Retry 3D" },
  "scene.pieceOf": { es: "pieza {n} de {total}", en: "piece {n} of {total}" },
  "scene.pickProject": { es: "Elegir proyecto", en: "Pick a project" },
  "scene.selected": { es: "Proyecto seleccionado", en: "Selected project" },
  "scene.viewProject": { es: "Ver proyecto", en: "View project" },
  "scene.readInTerminal": { es: "Leer en terminal", en: "Read in terminal" },
  "scene.sharesWith": { es: "Comparte tecnología con", en: "Shares technology with" },
  "scene.noConnections": { es: "Sin tecnologías compartidas", en: "No shared technologies" },
  "scene.fallbackAlt": {
    es: "Anillo de siete segmentos de aluminio, cada uno un proyecto",
    en: "Ring of seven aluminium segments, each one a project",
  },

  "cam.start": { es: "Usar cámara", en: "Use camera" },
  "cam.stop": { es: "Detener cámara", en: "Stop camera" },
  "cam.inactive": { es: "Cámara inactiva", en: "Camera off" },
  "cam.asking": {
    es: "Pidiendo permiso de cámara. Si no ves el aviso, mirá la barra de direcciones.",
    en: "Asking for camera permission. If you see no prompt, check the address bar.",
  },
  "cam.live": { es: "Cámara en vivo. El video no sale de tu navegador.", en: "Camera live. Video never leaves your browser." },
  "cam.denied": {
    es: "No hay permiso de cámara (o el navegador lo bloqueó). Volviendo al mapa.",
    en: "Camera permission denied (or blocked by the browser). Back to the map.",
  },
  "cam.unsupported": {
    es: "Este navegador no expone la cámara acá: hace falta https o localhost.",
    en: "This browser exposes no camera here: https or localhost is required.",
  },
  "cam.error": {
    es: "La cámara no pudo iniciarse. Volviendo al mapa.",
    en: "The camera could not start. Back to the map.",
  },

  "work.featured": { es: "Casos destacados", en: "Featured work" },
  "work.featuredLead": {
    es: "Dos sistemas con contexto, decisión técnica y la evidencia que hay.",
    en: "Two systems with context, the technical decision and the evidence at hand.",
  },
  "work.more": { es: "Más trabajo", en: "More work" },
  "work.context": { es: "Contexto", en: "Context" },
  "work.decision": { es: "Decisión técnica", en: "Technical decision" },
  "work.evidence": { es: "Evidencia", en: "Evidence" },
  "work.tech": { es: "Tecnologías", en: "Technologies" },
  "work.diagram": { es: "Esquema del sistema", en: "System diagram" },
  "work.detail": { es: "Detalle completo", en: "Full detail" },
  "work.hideDetail": { es: "Ocultar detalle", en: "Hide detail" },
  "work.highlights": { es: "Puntos clave", en: "Key points" },
  "work.flow": { es: "Flujo", en: "Flow" },
  "work.role": { es: "Rol", en: "Role" },
  "work.for": { es: "Para", en: "For" },
  "work.source": { es: "Código", en: "Source" },
  "work.live": { es: "En vivo", en: "Live" },
  "work.open": { es: "Abrir", en: "Open" },
  "work.close": { es: "Cerrar", en: "Close" },

  "about.title": { es: "Enfoque", en: "Approach" },
  "about.facts": { es: "Ficha", en: "At a glance" },
  "stack.title": { es: "Stack con evidencia", en: "Stack, backed by projects" },
  "stack.lead": {
    es: "Cada tecnología aparece con los proyectos donde se usó. Sin porcentajes.",
    en: "Every technology lists the projects it was used in. No percentages.",
  },
  "stack.projectsOne": { es: "1 proyecto", en: "1 project" },
  "stack.projectsMany": { es: "{n} proyectos", en: "{n} projects" },
  "experience.title": { es: "Experiencia", en: "Experience" },
  "experience.present": { es: "actual", en: "present" },

  "lab.title": { es: "Laboratorio", en: "Lab" },
  "lab.lead": {
    es: "La parte rara del sitio. Nada de esto se enciende solo.",
    en: "The odd part of the site. None of this turns on by itself.",
  },
  "lab.terminal": { es: "Abrir terminal", en: "Open terminal" },
  "lab.terminalBody": {
    es: "cd, open, cat, htop… y algunos comandos que no deberían existir.",
    en: "cd, open, cat, htop… and a few commands that should not exist.",
  },
  "lab.asciiBody": {
    es: "La misma escultura, pasada por el shader de glifos. Sólo cambia el área de la escena.",
    en: "The same sculpture, run through the glyph shader. Only the scene area changes.",
  },
  "lab.cameraBody": {
    es: "Tu cámara en ASCII. Pide permiso al tocar el botón y el video no sale del navegador.",
    en: "Your camera in ASCII. Asks for permission when you press the button; video never leaves the browser.",
  },
  "lab.catBody": {
    es: "Un gato camina por el borde inferior y tira cosas. Se guarda con el mismo botón o con `nocat`.",
    en: "A cat walks along the bottom edge and knocks things over. Put it away with the same button or `nocat`.",
  },
  "lab.commandsBody": {
    es: "La lista completa de lo que entiende la terminal, con su descripción.",
    en: "The full list of what the terminal understands, with descriptions.",
  },
  "lab.ascii": { es: "Probar ASCII", en: "Try ASCII" },
  "lab.camera": { es: "Usar cámara", en: "Use camera" },
  "lab.commands": { es: "Ver comandos", en: "See commands" },
  "lab.crt": { es: "Modo CRT", en: "CRT mode" },
  "lab.crtHint": {
    es: "Scanlines, estrellas y desgarro al hacer scroll rápido. Sólo mientras esté encendido.",
    en: "Scanlines, stars and tearing on fast scroll. Only while switched on.",
  },
  "lab.cat": { es: "Soltar el gato", en: "Release the cat" },
  "lab.catOff": { es: "Guardar el gato", en: "Put the cat away" },
  "lab.reduced": {
    es: "Tu sistema pide movimiento reducido: los efectos se muestran quietos.",
    en: "Your system prefers reduced motion: effects are shown still.",
  },

  "contact.title": { es: "Contacto", en: "Contact" },
  "contact.lead": {
    es: "Si tenés un sistema que tiene que aguantar, hablemos.",
    en: "If you have a system that has to hold up, let's talk.",
  },
  "contact.write": { es: "Escribime", en: "Write to me" },
  "contact.copy": { es: "Copiar correo", en: "Copy email" },
  "contact.copied": { es: "Correo copiado", en: "Email copied" },
  "contact.copyFailed": {
    es: "No se pudo copiar. Seleccioná el correo y copialo a mano.",
    en: "Could not copy. Select the email and copy it by hand.",
  },
  "footer.source": { es: "Código de este sitio", en: "Source of this site" },
  "footer.made": { es: "Hecho con Next.js y Three.js", en: "Built with Next.js and Three.js" },

  "term.hint": { es: "pulsá ~ para la terminal", en: "press ~ for terminal" },
  "term.open": { es: "Abrir terminal", en: "Open terminal" },
  "term.close": { es: "Cerrar terminal", en: "Close terminal" },
  "term.title": { es: "Terminal", en: "Terminal" },
  "term.input": { es: "Línea de comandos", en: "Command line" },
  "term.output": { es: "Salida de la terminal", en: "Terminal output" },
  "term.unknown": { es: "comando no encontrado", en: "command not found" },
  "term.help": { es: "escribí `help` para ver los comandos", en: "type `help` for commands" },
  "term.boot": {
    es: "seb.sys — escribí `help` para ver los comandos",
    en: "seb.sys — type `help` to list commands",
  },
  "term.usage": { es: "uso", en: "usage" },
  "term.noSection": { es: "no existe esa sección", en: "no such section" },
  "term.noProject": { es: "no existe ese proyecto", en: "no such project" },
  "term.ambiguous": { es: "varios proyectos coinciden:", en: "several projects match:" },
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
  "term.na": { es: "no disponible", en: "not available" },
  "term.notApplicable": { es: "no aplica", en: "not applicable" },
  "term.reduced": {
    es: "movimiento reducido activo: el efecto se muestra quieto",
    en: "reduced motion is on: the effect is shown still",
  },
  "term.webcamOn": {
    es: "cámara → glifos. nada sale de tu navegador. `webcam off` para salir",
    en: "camera → glyphs. nothing leaves your browser. `webcam off` to exit",
  },
  "term.webcamOff": { es: "cámara apagada", en: "camera off" },
  "term.screensaver": { es: "salvapantallas encendido. cualquier tecla lo apaga", en: "screensaver on. any key turns it off" },
  "vim.hint": { es: "escribí :q! como todos", en: "type :q! like everyone else" },
  "vim.nowrite": {
    es: "E37: no guardaste los cambios (agregá ! para forzar)",
    en: "E37: no write since last change (add ! to override)",
  },
  "vim.exit": { es: "Salir de vim", en: "Leave vim" },
  "power.back": { es: "pulsá cualquier tecla o tocá la pantalla", en: "press any key or tap the screen" },
  "power.on": { es: "Encender", en: "Power on" },
  "effect.close": { es: "Cerrar efecto", en: "Close effect" },

  "cmd.help": { es: "esta lista", en: "this list" },
  "cmd.ls": { es: "lista secciones y proyectos", en: "list sections and projects" },
  "cmd.cd": { es: "salta a una sección", en: "jump to a section" },
  "cmd.open": { es: "abre un proyecto por número o nombre", en: "open a project by number or name" },
  "cmd.cat": { es: "muestra un archivo… o un gato", en: "print a file… or a cat" },
  "cmd.whoami": { es: "quién soy", en: "who I am" },
  "cmd.neofetch": { es: "ficha del sistema", en: "system card" },
  "cmd.lang": { es: "cambia el idioma", en: "switch language" },
  "cmd.matrix": { es: "no preguntes", en: "don't ask" },
  "cmd.webcam": { es: "verte a vos mismo en ASCII", en: "see yourself in ASCII" },
  "cmd.coffee": { es: "café", en: "coffee" },
  "cmd.htop": { es: "qué está haciendo esta página", en: "what this page is doing" },
  "cmd.theme": { es: "fósforo verde o ámbar", en: "green or amber phosphor" },
  "cmd.mode": { es: "cambia la presentación de la escena", en: "switch the scene presentation" },
  "cmd.vim": { es: "abrí vim. suerte saliendo", en: "open vim. good luck leaving" },
  "cmd.sl": { es: "un tren", en: "a train" },
  "cmd.screensaver": { es: "el salvapantallas, ahora", en: "the screensaver, now" },
  "cmd.poweroff": { es: "apagá el monitor", en: "turn the monitor off" },
  "cmd.clear": { es: "limpia la pantalla", en: "clear the screen" },
  "cmd.exit": { es: "cierra la terminal", en: "close the terminal" },

  "a11y.skip": { es: "Saltar al contenido principal", en: "Skip to main content" },
  "a11y.decorative": { es: "Arte ASCII decorativo", en: "Decorative ASCII art" },

  "notFound.title": { es: "Esta ruta no existe", en: "This route does not exist" },
  "notFound.lead": {
    es: "El sistema no encontró lo que pediste. Todo lo demás sigue en su lugar.",
    en: "The system could not find what you asked for. Everything else is where it was.",
  },
  "notFound.back": { es: "Volver al inicio", en: "Back to the start" },
} as const satisfies Record<string, Bi>;

export type UIKey = keyof typeof UI;

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: UIKey, vars?: Record<string, string | number>) => string;
  /** Resuelve un par bilingüe con el idioma activo. */
  b: (value: Bi) => string;
};

const LangContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "seb.sys.lang";

/* El idioma vive en un store externo: el servidor siempre renderiza
   español (determinista) y el cliente aplica la preferencia guardada o
   la del navegador en el primer render post-hidratación. El flash que
   eso produce dura un cuadro y está documentado en DESIGN.md; la
   alternativa — esconder el contenido hasta hidratar — es peor. */
const langStore = createStore<Lang>("es");
let langInitialized = false;

function initLang() {
  if (langInitialized || typeof window === "undefined") return;
  langInitialized = true;
  const stored = readStorage(STORAGE_KEY);
  if (stored === "es" || stored === "en") {
    langStore.set(stored);
    return;
  }
  const browser = typeof navigator !== "undefined" ? navigator.language : "es";
  if (!browser.toLowerCase().startsWith("es")) langStore.set("en");
}

function getClientLang(): Lang {
  initLang();
  return langStore.get();
}

export function format(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, k: string) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}

export function LangProvider({ children }: { children: ReactNode }) {
  const lang = useStoreValue(
    { get: getClientLang, set: langStore.set, subscribe: langStore.subscribe },
    "es",
  );

  // Único efecto: sincronizar el documento con el idioma (sistema externo).
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    langStore.set(l);
    writeStorage(STORAGE_KEY, l);
  }, []);
  const toggleLang = useCallback(() => {
    setLang(langStore.get() === "es" ? "en" : "es");
  }, [setLang]);

  const t = useCallback(
    (key: UIKey, vars?: Record<string, string | number>) => format(UI[key][lang], vars),
    [lang],
  );
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

/** Traducción fuera de React (comandos de la terminal, etc.). */
export function translate(key: UIKey, lang: Lang, vars?: Record<string, string | number>): string {
  return format(UI[key][lang], vars);
}
