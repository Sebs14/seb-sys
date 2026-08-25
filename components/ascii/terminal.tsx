"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Frame } from "./frame";
import { useLang, type UIKey } from "@/lib/i18n";
import { emit, on } from "@/lib/bus";
import {
  identity,
  projects,
  about,
  stack,
  experience,
  contactLinks,
} from "@/lib/content";

/* ══════════════════════════════════════════════════════════════
   TERMINAL

   La forma de navegar que este sitio pide: si todo está dibujado
   con caracteres, la línea de comandos no es un adorno, es el
   control natural. `~` la abre, Escape la cierra, y en móvil hay
   un botón porque ahí no existe la tecla.

   Los comandos que MUEVEN la página (cd, open) hacen scroll real
   a la sección: la URL y el historial siguen siendo la fuente de
   verdad, la terminal es otra manera de llegar.
   ══════════════════════════════════════════════════════════════ */

type Line = { id: number; kind: "in" | "out" | "dim" | "art"; text: string };

/** Color por tipo de línea. Compartido entre lo ya impreso y lo que se
    está escribiendo, para que no cambien de tono al terminar. */
function toneOf(kind: Line["kind"]): string {
  if (kind === "in") return "text-term-green";
  if (kind === "dim") return "text-term-green-dim";
  if (kind === "art") return "whitespace-pre text-term-green-deep";
  return "text-term-white";
}

/** Alias por sección, en los dos idiomas: `cd proyectos` y `cd work`. */
const SECTIONS: { id: string; aliases: string[] }[] = [
  { id: "about", aliases: ["about", "sobre_mi", "sobre", "mi"] },
  { id: "work", aliases: ["work", "proyectos", "trabajo"] },
  { id: "stack", aliases: ["stack", "tecnologias", "tech"] },
  { id: "experience", aliases: ["experience", "experiencia", "exp"] },
  { id: "contact", aliases: ["contact", "contacto"] },
];

const COFFEE = [
  "      ( (",
  "       ) )",
  "    ........",
  "    |      |]",
  "    \\      /",
  "     `----'",
];

const LOGO = ["┌────────┐", "│ ░▒▓██▓ │", "│ ▓██▓▒░ │", "└────────┘"];

/** Velocidad del tipeo: 3 caracteres cada 12 ms ≈ 250 por segundo.
    Rápido como un `cat` real, no como un chat de novela. */
const CHARS_PER_TICK = 3;
const TICK_MS = 12;

/** Ancho de celda del hero, en px de CSS (ver `AsciiHero`). */
const HERO_CELL = 6;
/** Relación de la celda monoespaciada; la misma del atlas de glifos. */
const HERO_ASPECT = 0.6;

/**
 * Mide de verdad: cuenta cuadros durante 600 ms. Nada de números
 * inventados — si un dato no se puede medir, dice "n/d" en vez de
 * rellenar con algo que parezca creíble.
 */
function sampleFps(): Promise<number> {
  return new Promise((resolve) => {
    const t0 = performance.now();
    let frames = 0;
    const tick = () => {
      frames += 1;
      const elapsed = performance.now() - t0;
      if (elapsed < 600) requestAnimationFrame(tick);
      else resolve(Math.round(frames / (elapsed / 1000)));
    };
    requestAnimationFrame(tick);
  });
}

/** Aristas del grafo = pares de proyectos que comparten tecnología. */
function graphEdges(): number {
  let n = 0;
  for (let i = 0; i < projects.length; i += 1) {
    for (let j = i + 1; j < projects.length; j += 1) {
      if (projects[i].tags.some((t) => projects[j].tags.includes(t))) n += 1;
    }
  }
  return n;
}

const PHOSPHOR_KEY = "seb.sys.phosphor";

const HELP: { cmd: string; key: UIKey }[] = [
  { cmd: "help", key: "cmd.help" },
  { cmd: "ls", key: "cmd.ls" },
  { cmd: "cd <sección>", key: "cmd.cd" },
  { cmd: "open <n>", key: "cmd.open" },
  { cmd: "cat [archivo]", key: "cmd.cat" },
  { cmd: "whoami", key: "cmd.whoami" },
  { cmd: "neofetch", key: "cmd.neofetch" },
  { cmd: "lang es|en", key: "cmd.lang" },
  { cmd: "htop", key: "cmd.htop" },
  { cmd: "theme green|amber", key: "cmd.theme" },
  { cmd: "matrix", key: "cmd.matrix" },
  { cmd: "webcam [off]", key: "cmd.webcam" },
  { cmd: "coffee", key: "cmd.coffee" },
  { cmd: "vim", key: "cmd.vim" },
  { cmd: "poweroff", key: "cmd.poweroff" },
  { cmd: "clear", key: "cmd.clear" },
  { cmd: "exit", key: "cmd.exit" },
];


export function Terminal() {
  const { lang, setLang, t, b } = useLang();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const [focused, setFocused] = useState(false);

  const seq = useRef(0);
  const reduced = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  /* ── motor de tipeo ─────────────────────────────────────────
     Un terminal no te teletransporta al contenido: lo escribe. Así
     que la salida NO aparece de golpe — entra a una cola y se va
     tipeando línea por línea. La línea del comando sí es instantánea:
     esa la escribió el usuario, no la máquina.                      */

  const queue = useRef<{ kind: Line["kind"]; text: string }[]>([]);
  const active = useRef<{ kind: Line["kind"]; full: string; shown: number } | null>(
    null,
  );
  const [typing, setTyping] = useState<Line["kind"] | null>(null);
  const [partial, setPartial] = useState("");

  const commit = useCallback((kind: Line["kind"], text: string) => {
    // El id se resuelve ACÁ, no dentro del updater: React agrupa los
    // setLines de un mismo tick y los updaters corren después de todos
    // los incrementos, así que leer seq.current adentro le daba a cada
    // línea el mismo número → claves duplicadas.
    const id = (seq.current += 1);
    setLines((prev) => [...prev, { id, kind, text }]);
  }, []);

  /** Imprime de golpe todo lo pendiente. */
  const flush = useCallback(() => {
    const rest: Line[] = [];
    if (active.current) {
      rest.push({ id: (seq.current += 1), kind: active.current.kind, text: active.current.full });
      active.current = null;
    }
    queue.current.forEach((item) => {
      rest.push({ id: (seq.current += 1), kind: item.kind, text: item.text });
    });
    queue.current = [];
    if (rest.length) setLines((prev) => [...prev, ...rest]);
    setTyping(null);
    setPartial("");
  }, []);

  /** La entrada del usuario va directo; la salida de la máquina, a la cola. */
  const push = useCallback(
    (kind: Line["kind"], text: string) => {
      if (kind === "in" || reduced.current) {
        commit(kind, text);
        return;
      }
      queue.current.push({ kind, text });
    },
    [commit],
  );

  useEffect(() => {
    // Sólo mientras está abierta: con la terminal cerrada este timer
    // despertaba 83 veces por segundo para no hacer nada.
    if (!open) return;
    const timer = setInterval(() => {
      if (!active.current) {
        const next = queue.current.shift();
        if (!next) return;
        active.current = { kind: next.kind, full: next.text, shown: 0 };
      }
      const cur = active.current;
      cur.shown = Math.min(cur.full.length, cur.shown + CHARS_PER_TICK);
      if (cur.shown >= cur.full.length) {
        commit(cur.kind, cur.full);
        active.current = null;
        setTyping(null);
        setPartial("");
      } else {
        setTyping(cur.kind);
        setPartial(cur.full.slice(0, cur.shown));
      }
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [commit, open]);

  const pushAll = useCallback(
    (kind: Line["kind"], texts: string[]) => texts.forEach((x) => push(kind, x)),
    [push],
  );

  /* ── comandos ─────────────────────────────────────────────── */

  /** Escribe la ficha completa de un proyecto. La usan el comando
      `open` y el clic en un nodo del grafo 3D. */
  const printProject = useCallback(
    (project: (typeof projects)[number]) => {
      push("dim", `── ${project.name} ── ${b(project.org)} · ${project.year}`);
      if (project.flow) push("out", project.flow);
      push("out", "");
      push("out", b(project.description));
      project.highlights?.forEach((h) => push("dim", `├─ ${b(h)}`));
      push("out", `[${project.tags.join("] [")}]`);
    },
    [b, push],
  );

  const goto = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // La URL queda apuntando a la sección: recargar cae en el mismo lugar.
      window.history.replaceState(null, "", `#${id}`);
      return true;
    },
    [],
  );

  const run = useCallback(
    (raw: string) => {
      const input = raw.trim();
      if (!input) return;

      push("in", input);
      const [cmd, ...args] = input.split(/\s+/);
      const arg = args.join(" ").toLowerCase();

      switch (cmd.toLowerCase()) {
        case "help":
        case "?":
          pushAll(
            "out",
            HELP.map((h) => `  ${h.cmd.padEnd(16, " ")}${t(h.key)}`),
          );
          return;

        case "ls":
          push("dim", `${t("term.sections")}/`);
          pushAll(
            "out",
            SECTIONS.map((s) => `  ${s.aliases[lang === "es" ? 1 : 0]}`),
          );
          push("dim", `${t("term.projects")}/`);
          pushAll(
            "out",
            projects.map((p, i) => `  ${String(i + 1).padStart(2, " ")}  ${p.name}`),
          );
          return;

        case "cd":
        case "goto": {
          if (!arg) {
            push("dim", `${t("term.usage")}: cd <${t("term.sections")}>`);
            return;
          }
          if (["/", "~", "inicio", "home", "top"].includes(arg)) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            push("out", `${t("term.going")} /`);
            return;
          }
          const found = SECTIONS.find((s) => s.aliases.includes(arg));
          if (found && goto(found.id)) push("out", `${t("term.going")} /${arg}`);
          else push("out", t("term.noSection"));
          return;
        }

        case "open": {
          const n = Number.parseInt(arg, 10);
          const project = Number.isNaN(n)
            ? projects.find((p) => p.name.toLowerCase().includes(arg) || p.id === arg)
            : projects[n - 1];
          if (!project) {
            push("out", t("term.noProject"));
            return;
          }
          // No te mueve la página: te ESCRIBE la ficha acá. La card
          // igual queda abierta para cuando bajes con el mouse.
          emit({ type: "open-project", id: project.id });
          printProject(project);
          return;
        }

        case "cat": {
          // El chiste está en que el comando es el animal.
          if (!arg || arg === "cat" || arg === "gato") {
            emit({ type: "cat", on: true });
            push("out", t("term.catOn"));
            return;
          }
          // `cat <sección>` es el corazón del pedido: en vez de saltar
          // ahí, el contenido se escribe en la terminal.
          const file = arg.replace(/\.(txt|md)$/, "");
          const target = SECTIONS.find((sec) => sec.aliases.includes(file));

          if (target?.id === "about") {
            about.paragraphs.forEach((par) => {
              push("out", b(par));
              push("out", "");
            });
            return;
          }
          if (target?.id === "work") {
            projects.forEach((proj, i) => {
              push("dim", `${String(i + 1).padStart(2, " ")}  ${proj.name}`);
              push("out", `    ${b(proj.tagline)}`);
            });
            return;
          }
          if (target?.id === "stack") {
            stack.forEach((group) => {
              push("dim", `░▒▓ ${b(group.label)}`);
              group.items.forEach((item) => {
                const filled = Math.round((item.level / 100) * 10);
                push(
                  "out",
                  `  ${item.name.padEnd(12, " ")}${"█".repeat(filled)}${"░".repeat(10 - filled)}  ${item.level}`,
                );
              });
              push("out", "");
            });
            return;
          }
          if (target?.id === "experience") {
            experience.forEach((job) => {
              push("dim", `${job.from}—${job.to ?? t("ui.present")}  ${job.company}`);
              push("out", `  ${b(job.role)}`);
              job.bullets.forEach((bl) => push("out", `  ├─ ${b(bl)}`));
              push("out", "");
            });
            return;
          }
          if (target?.id === "contact") {
            contactLinks.forEach((link) =>
              push("out", `${link.label.padEnd(9, " ")}${link.value}`),
            );
            return;
          }
          push("out", `cat: ${file}: ${t("term.unknown")}`);
          return;
        }

        case "nocat":
          emit({ type: "cat", on: false });
          push("out", t("term.catOff"));
          return;

        case "whoami":
          push("out", `${identity.name} — ${b(identity.role)}, ${b(identity.location)}`);
          return;

        case "neofetch":
          LOGO.forEach((art, i) => {
            const fields = [
              `${identity.handle}@seb.sys`,
              "─────────────────",
              `${b(identity.role)}`,
              `${projects.length} ${t("term.projects")}`,
            ];
            push("art", `  ${art}   ${fields[i] ?? ""}`);
          });
          return;

        case "lang":
          if (arg === "es" || arg === "en") {
            setLang(arg);
            push("out", `lang = ${arg}`);
          } else {
            push("dim", `${t("term.usage")}: lang es|en`);
          }
          return;

        case "matrix":
          emit({ type: "matrix" });
          push("out", "wake up…");
          return;

        case "webcam": {
          const off = arg === "off" || arg === "no";
          emit({ type: "webcam", on: !off });
          push("out", t(off ? "term.webcamOff" : "term.webcamOn"));
          return;
        }

        case "coffee":
          pushAll("art", COFFEE);
          push("dim", "418 — I'm a teapot");
          return;

        case "sudo":
          push("out", t("term.sudo"));
          return;

        case "rm":
          push("out", t("term.rm"));
          return;

        case "htop": {
          push("dim", t("term.measuring"));
          const canvas = document.querySelector("canvas");
          const rect = canvas?.getBoundingClientRect();
          const cols = rect ? Math.round(rect.width / HERO_CELL) : 0;
          const rows = rect ? Math.round(rect.height / (HERO_CELL / HERO_ASPECT)) : 0;
          const mem = (performance as { memory?: { usedJSHeapSize: number } }).memory;
          const up = Math.round(performance.now() / 1000);

          void sampleFps().then((fps) => {
            const row = (k: string, v: string) => push("out", `  ${k.padEnd(15, " ")}${v}`);
            push("dim", "seb.sys ── htop");
            row("fps", String(fps));
            row("heap", mem ? `${Math.round(mem.usedJSHeapSize / 1048576)} MB` : "n/d");
            row("celdas", cols && rows ? `${cols} × ${rows}` : "n/d");
            row("glifos/cuadro", cols && rows ? String(cols * rows) : "n/d");
            row("grafo", `${projects.length} nodos · ${graphEdges()} aristas`);
            row("nodos DOM", String(document.getElementsByTagName("*").length));
            row("webgl", canvas ? "activo" : "sin contexto");
            row("uptime", `${Math.floor(up / 60)}m ${up % 60}s`);
          });
          return;
        }

        case "theme": {
          const amber = arg === "amber" || arg === "ambar" || arg === "ámbar";
          const green = arg === "green" || arg === "verde";
          if (!amber && !green) {
            push("dim", `${t("term.usage")}: theme green|amber`);
            return;
          }
          const root = document.documentElement;
          if (amber) root.setAttribute("data-phosphor", "amber");
          else root.removeAttribute("data-phosphor");
          window.localStorage.setItem(PHOSPHOR_KEY, amber ? "amber" : "green");
          push("out", `phosphor = ${amber ? "amber" : "green"}`);
          return;
        }

        case "sl":
          emit({ type: "train" });
          return;

        case "vim":
        case "vi":
          emit({ type: "vim" });
          return;

        case "poweroff":
        case "shutdown":
          emit({ type: "poweroff" });
          return;

        case "clear":
          setLines([]);
          return;

        case "exit":
        case "q":
          setOpen(false);
          return;

        default:
          push("out", `${cmd}: ${t("term.unknown")}`);
          push("dim", t("term.help"));
      }
    },
    [b, goto, lang, printProject, push, pushAll, setLang, t],
  );

  /* ── apertura ─────────────────────────────────────────────── */

  // El fósforo elegido sobrevive a la recarga.
  useEffect(() => {
    if (window.localStorage.getItem(PHOSPHOR_KEY) === "amber") {
      document.documentElement.setAttribute("data-phosphor", "amber");
    }
  }, []);

  // Con movimiento reducido no se tipea nada: todo sale de una.
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el?.tagName === "INPUT" ||
        el?.tagName === "TEXTAREA" ||
        el?.isContentEditable;

      if (!open && e.key === "~" && !typing) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (open && e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // El gato se esconde mientras la terminal está abierta: camina por el
  // mismo borde inferior y asomaba cortado por debajo del panel.
  useEffect(() => {
    emit({ type: "terminal", open });
  }, [open]);

  // Avisos que manda cualquier otra pieza (estado de la cámara, etc.).
  useEffect(
    () =>
      on((e) => {
        if (e.type === "notice") push("dim", e.text);
      }),
    [push],
  );

  // Clic en un nodo del grafo 3D: se abre la terminal y escribe la ficha.
  useEffect(
    () =>
      on((e) => {
        if (e.type !== "print-project") return;
        const project = projects.find((p) => p.id === e.id);
        if (!project) return;
        setOpen(true);
        printProject(project);
      }),
    [printProject],
  );

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    if (lines.length === 0) push("dim", t("term.boot"));
    // El mensaje de arranque se imprime una vez, no en cada apertura.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // El log siempre muestra lo último.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [lines, partial]);

  /* ── render ───────────────────────────────────────────────── */

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="glow fixed bottom-[var(--lh)] right-[2ch] z-[95] cursor-pointer select-none bg-term-bg px-[1ch] text-term-green hover:glow-strong"
        aria-label={t("term.open")}
        title={t("term.hint")}
      >
        [~]
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[95] px-[2ch] pb-[calc(var(--lh)/2)]">
      <div className="mx-auto max-w-[110ch] bg-term-bg/95 backdrop-blur-[2px]">
        <Frame variant="double" tone="green" title={t("term.title")} meta="~" glow>
          <div
            ref={logRef}
            className="max-h-[36vh] overflow-y-auto whitespace-pre-wrap break-words"
          >
            {lines.map((line) => (
              <div key={line.id} className={toneOf(line.kind)}>
                {line.kind === "in" ? `$ ${line.text}` : line.text}
              </div>
            ))}

            {/* La línea que se está escribiendo, con su cursor al final. */}
            {typing && (
              <div className={toneOf(typing)}>
                {partial}
                <span aria-hidden className="text-term-green">
                  ▌
                </span>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Nada bloquea: lo que faltaba escribirse sale de golpe y
              // el comando nuevo corre enseguida.
              flush();
              run(value);
              if (value.trim()) {
                setHistory((h) => [value.trim(), ...h]);
                setCursor(-1);
              }
              setValue("");
            }}
            className="flex items-baseline gap-[1ch] border-t border-term-line pt-[calc(var(--lh)/2)]"
          >
            <span aria-hidden className="select-none text-term-green">
              $
            </span>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              data-caret-focus
              onKeyDown={(e) => {
                // Flechas = historial, igual que en una shell de verdad.
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  const next = Math.min(cursor + 1, history.length - 1);
                  if (next >= 0) {
                    setCursor(next);
                    setValue(history[next]);
                  }
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  const next = cursor - 1;
                  setCursor(next);
                  setValue(next >= 0 ? history[next] : "");
                }
              }}
              spellCheck={false}
              autoComplete="off"
              aria-label={t("term.title")}
              // Sin contorno de foco: el bloque ▮ de al lado ES el indicador,
              // y un recuadro de formulario rompe la ilusión de terminal.
              className="min-w-0 flex-1 bg-transparent text-term-white caret-transparent outline-none focus-visible:outline-none"
            />
            {/* Éste es el indicador de foco del input: bloque lleno y
                parpadeando cuando escribís, hueco y apagado cuando no.
                Cumple la misma función que un contorno, en caracteres. */}
            <span
              aria-hidden
              className={
                focused
                  ? "animate-blink select-none text-term-green"
                  : "select-none text-term-green-deep"
              }
            >
              {focused ? "▮" : "▯"}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 cursor-pointer select-none text-term-green-dim hover:text-term-green"
            >
              [{t("term.close")}]
            </button>
          </form>
        </Frame>
      </div>
    </div>
  );
}
