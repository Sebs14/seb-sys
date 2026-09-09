"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLang } from "@/lib/i18n";
import { emit, on } from "@/lib/bus";
import { projects } from "@/lib/content";
import { readStorage, writeStorage } from "@/lib/preference-store";
import { motionIsStill, useMotionPreference } from "@/lib/use-motion-preference";
import { sceneStats, sampleSceneFps } from "@/lib/scene-stats";
import { runCommand, projectLines } from "@/lib/terminal/commands";
import { emptyHistory, moveDown, moveUp, pushEntry, type HistoryState } from "@/lib/terminal/history";
import type { CommandEffect, LineKind, OutputLine } from "@/lib/terminal/types";
import { clsx } from "@/lib/clsx";

/* ══════════════════════════════════════════════════════════════
   TERMINAL

   Región complementaria no modal, flotante, en mono. `~` la abre (sin
   depender de la tecla: también hay botones en la barra y en el
   laboratorio). Escape la cierra y devuelve el foco a quien la abrió.

   La lógica de comandos vive en lib/terminal (pura, probada); esto es
   la capa de UI: cola de tipeo, historial con borrador, foco y log.
   ══════════════════════════════════════════════════════════════ */

type Line = OutputLine & { id: number };

const CHARS_PER_TICK = 3;
const TICK_MS = 12;
const LOG_LIMIT = 500;
const PHOSPHOR_KEY = "seb.sys.phosphor";

function toneOf(kind: LineKind): string {
  return `ln-${kind}`;
}

export function Terminal() {
  const { lang, setLang, t } = useLang();
  const { still } = useMotionPreference();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [history, setHistory] = useState<HistoryState>(emptyHistory);
  const [typing, setTyping] = useState<LineKind | null>(null);
  const [partial, setPartial] = useState("");

  const seq = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const booted = useRef(false);
  const queue = useRef<OutputLine[]>([]);
  const active = useRef<{ kind: LineKind; full: string; shown: number } | null>(null);

  const commit = useCallback((kind: LineKind, text: string) => {
    const id = (seq.current += 1);
    setLines((prev) => {
      const next = [...prev, { id, kind, text }];
      return next.length > LOG_LIMIT ? next.slice(next.length - LOG_LIMIT) : next;
    });
  }, []);

  /** Imprime de golpe todo lo pendiente. */
  const flush = useCallback(() => {
    const rest: Line[] = [];
    if (active.current) {
      rest.push({ id: (seq.current += 1), kind: active.current.kind, text: active.current.full });
      active.current = null;
    }
    queue.current.forEach((item) => rest.push({ id: (seq.current += 1), ...item }));
    queue.current = [];
    if (rest.length) {
      setLines((prev) => {
        const next = [...prev, ...rest];
        return next.length > LOG_LIMIT ? next.slice(next.length - LOG_LIMIT) : next;
      });
    }
    setTyping(null);
    setPartial("");
  }, []);

  /** La entrada del usuario va directo; la salida de la máquina, a la cola. */
  const push = useCallback(
    (line: OutputLine) => {
      if (line.kind === "in" || motionIsStill()) {
        commit(line.kind, line.text);
        return;
      }
      queue.current.push(line);
    },
    [commit],
  );

  // Motor de tipeo: sólo mientras está abierta.
  useEffect(() => {
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

  // Si el sistema pasa a movimiento reducido, lo pendiente sale de una.
  useEffect(() => {
    if (still) flush();
  }, [still, flush]);

  const clear = useCallback(() => {
    queue.current = [];
    active.current = null;
    setTyping(null);
    setPartial("");
    setLines([]);
  }, []);

  const closeTerminal = useCallback(() => {
    setOpen(false);
    const target = opener.current;
    // Devolver el foco a quien la abrió; si ya no está, al control estable.
    requestAnimationFrame(() => {
      if (target && document.contains(target)) target.focus();
      else document.querySelector<HTMLElement>("[data-terminal-opener]")?.focus();
    });
  }, []);

  const openTerminal = useCallback(() => {
    const el = document.activeElement as HTMLElement | null;
    if (el && el !== document.body) opener.current = el;
    setOpen(true);
  }, []);

  const htop = useCallback(async () => {
    const fps = await sampleSceneFps(600);
    const row = (k: string, v: string) => push({ kind: "out", text: `  ${k.padEnd(16, " ")}${v}` });
    const na = t("term.na");
    push({ kind: "dim", text: "seb.sys ── htop" });
    if (fps === null || sceneStats.status === null) {
      row("scene", na);
    } else {
      row("scene fps", `${fps} (${sceneStats.frameloop ?? na})`);
      row("status", sceneStats.status ?? na);
      row("mode", sceneStats.mode ?? na);
      row("quality", sceneStats.quality ?? na);
      row("draw calls", sceneStats.frames ? String(sceneStats.drawCalls) : na);
      row("triangles", sceneStats.frames ? String(sceneStats.triangles) : na);
      row("dpr", sceneStats.dpr ? sceneStats.dpr.toFixed(2) : na);
      row(
        "ascii cells",
        sceneStats.mode === "ascii" && sceneStats.asciiCells
          ? `${sceneStats.asciiCells.cols} × ${sceneStats.asciiCells.rows}`
          : t("term.notApplicable"),
      );
      row("textures", String(sceneStats.textures));
      row("geometries", String(sceneStats.geometries));
    }
    const mem = (performance as { memory?: { usedJSHeapSize: number } }).memory;
    row("js heap", mem ? `${Math.round(mem.usedJSHeapSize / 1048576)} MB` : na);
    row("dom nodes", String(document.getElementsByTagName("*").length));
    const up = Math.round(performance.now() / 1000);
    row("uptime", `${Math.floor(up / 60)}m ${up % 60}s`);
  }, [push, t]);

  const applyEffect = useCallback(
    (effect: CommandEffect) => {
      switch (effect.type) {
        case "scroll": {
          if (effect.target === "top") {
            window.scrollTo({ top: 0, behavior: motionIsStill() ? "auto" : "smooth" });
            window.history.replaceState(null, "", window.location.pathname);
            return;
          }
          const el = document.getElementById(effect.target);
          if (!el) return;
          el.scrollIntoView({ behavior: motionIsStill() ? "auto" : "smooth", block: "start" });
          window.history.replaceState(null, "", `#${effect.target}`);
          return;
        }
        case "open-project":
          emit({ type: "open-project", id: effect.id });
          return;
        case "select-project":
          emit({ type: "select-project", id: effect.id });
          return;
        case "print-project": {
          const project = projects.find((p) => p.id === effect.id);
          if (project) projectLines(project, lang).forEach(push);
          return;
        }
        case "scene-mode":
          emit({ type: "scene-mode", mode: effect.mode });
          return;
        case "set-lang":
          setLang(effect.lang);
          return;
        case "theme": {
          const root = document.documentElement;
          if (effect.phosphor === "amber") root.setAttribute("data-phosphor", "amber");
          else root.removeAttribute("data-phosphor");
          writeStorage(PHOSPHOR_KEY, effect.phosphor);
          return;
        }
        case "cat":
          emit({ type: "cat", on: effect.on });
          return;
        case "effect":
          if (motionIsStill() && effect.name !== "vim") {
            push({ kind: "dim", text: t("term.reduced") });
          }
          emit({ type: "effect", name: effect.name });
          return;
        case "webcam":
          emit({ type: "webcam", on: effect.on });
          return;
        case "htop":
          void htop();
          return;
        case "clear":
          clear();
          return;
        case "close":
          closeTerminal();
          return;
      }
    },
    [clear, closeTerminal, htop, lang, push, setLang, t],
  );

  const run = useCallback(
    (raw: string) => {
      const result = runCommand(raw, { lang });
      result.lines.forEach(push);
      result.effects.forEach(applyEffect);
    },
    [applyEffect, lang, push],
  );

  // El fósforo elegido sobrevive a la recarga.
  useEffect(() => {
    if (readStorage(PHOSPHOR_KEY) === "amber") {
      document.documentElement.setAttribute("data-phosphor", "amber");
    }
  }, []);

  // `~` abre; Escape cierra. Ninguno cuando se está escribiendo en otro campo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const editing =
        el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || el?.isContentEditable;
      if (!open && e.key === "~" && !editing) {
        e.preventDefault();
        openTerminal();
        return;
      }
      if (open && e.key === "Escape") closeTerminal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openTerminal, closeTerminal]);

  useEffect(() => {
    emit({ type: "terminal", open });
  }, [open]);

  // Entradas por el bus: abrir/cerrar, avisos y fichas.
  useEffect(
    () =>
      on((e) => {
        if (e.type === "terminal" && e.open && !open) openTerminal();
        if (e.type === "terminal" && !e.open && open) closeTerminal();
        if (e.type === "notice") push({ kind: "dim", text: e.text });
        if (e.type === "print-project") {
          const project = projects.find((p) => p.id === e.id);
          if (!project) return;
          if (!open) openTerminal();
          projectLines(project, lang).forEach(push);
        }
      }),
    [open, openTerminal, closeTerminal, push, lang],
  );

  // Al abrir por intención del usuario: foco al input, mensaje de arranque una vez.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    if (!booted.current) {
      booted.current = true;
      push({ kind: "dim", text: t("term.boot") });
    }
  }, [open, push, t]);

  // El log siempre muestra lo último.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [lines, partial]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    flush();
    const trimmed = value.trim();
    if (trimmed) {
      run(trimmed);
      setHistory((h) => pushEntry(h, trimmed));
    }
    setValue("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const r = moveUp(history, value);
      setHistory(r.state);
      setValue(r.value);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const r = moveDown(history);
      setHistory(r.state);
      setValue(r.value);
    }
  };

  const reduce = still;

  return (
    <>
      {!open && (
        <button
          type="button"
          data-terminal-opener
          onClick={openTerminal}
          className="glass terminal fixed bottom-4 right-4 z-[95] inline-flex h-11 items-center gap-2 rounded-full px-4 text-phosphor"
          aria-label={t("term.open")}
          title={t("term.hint")}
        >
          <span aria-hidden>~</span>
          <span className="hidden sm:inline text-ink-2">{t("term.title")}</span>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.aside
            key="terminal"
            role="complementary"
            aria-label={t("term.title")}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 170, damping: 26, mass: 1 }}
            className="fixed inset-x-3 bottom-3 z-[95] sm:inset-x-6 sm:bottom-6"
          >
            <div className="glass terminal mx-auto max-w-[var(--content-max)] rounded-[var(--radius-panel)]">
              <div className="flex items-center justify-between gap-3 border-b border-stroke px-4 py-2">
                <p className="t-meta text-ink-3">
                  <span className="text-phosphor">~</span> {t("term.title")} · {lang}
                </p>
                <button type="button" onClick={closeTerminal} className="icon-btn" aria-label={t("term.close")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <div
                ref={logRef}
                role="log"
                aria-live="polite"
                aria-label={t("term.output")}
                tabIndex={0}
                className="max-h-[38vh] overflow-y-auto whitespace-pre-wrap break-words px-4 py-3 [scrollbar-width:thin]"
              >
                {lines.map((line) => (
                  <div key={line.id} className={toneOf(line.kind)}>
                    {line.kind === "in" ? `$ ${line.text}` : line.text || " "}
                  </div>
                ))}
                {/* La línea que se escribe no se anuncia carácter a carácter. */}
                {typing && (
                  <div className={toneOf(typing)} aria-hidden>
                    {partial}
                    <span className="text-phosphor">▌</span>
                  </div>
                )}
              </div>

              <form onSubmit={submit} className="flex items-center gap-3 border-t border-stroke px-4 py-2">
                <span aria-hidden className="select-none text-phosphor">
                  $
                </span>
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKeyDown}
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                  aria-label={t("term.input")}
                  className={clsx(
                    "min-h-11 min-w-0 flex-1 bg-transparent text-ink outline-none",
                    "placeholder:text-ink-3",
                  )}
                  placeholder={t("term.help")}
                />
              </form>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
