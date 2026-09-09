import { translate, type Lang, type Bi } from "../i18n";
import { identity, projects, about, stack, experience, contactLinks } from "../content";
import { buildExpertise } from "../expertise";
import { parseCommand, resolveProjectArg } from "./parse-command";
import type { CommandEffect, CommandResult, OutputLine } from "./types";

/* ══════════════════════════════════════════════════════════════
   COMANDOS DE LA TERMINAL — ejecución pura

   `runCommand` recibe texto y devuelve líneas + efectos. No toca el
   DOM ni React: el componente aplica los efectos. Así los comandos se
   prueban en Node y la terminal queda como una capa fina de UI.
   ══════════════════════════════════════════════════════════════ */

export type CommandContext = {
  lang: Lang;
  /** Estado que sólo el componente conoce y que algunos comandos leen. */
  sceneMode?: "core" | "systems" | "ascii" | null;
};

/** Alias por sección, en los dos idiomas: `cd proyectos` y `cd work`. */
export const SECTIONS: { id: string; aliases: string[] }[] = [
  { id: "work", aliases: ["work", "proyectos", "projects", "trabajo"] },
  { id: "about", aliases: ["about", "enfoque", "sobre_mi", "sobre", "approach"] },
  { id: "stack", aliases: ["stack", "tecnologias", "tech"] },
  { id: "experience", aliases: ["experience", "experiencia", "exp"] },
  { id: "lab", aliases: ["lab", "laboratorio"] },
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

export const HELP: { cmd: string; key: Parameters<typeof translate>[0] }[] = [
  { cmd: "help", key: "cmd.help" },
  { cmd: "ls", key: "cmd.ls" },
  { cmd: "cd <sección>", key: "cmd.cd" },
  { cmd: "open <n|nombre>", key: "cmd.open" },
  { cmd: "cat [archivo]", key: "cmd.cat" },
  { cmd: "whoami", key: "cmd.whoami" },
  { cmd: "neofetch", key: "cmd.neofetch" },
  { cmd: "lang es|en", key: "cmd.lang" },
  { cmd: "htop", key: "cmd.htop" },
  { cmd: "theme green|amber", key: "cmd.theme" },
  { cmd: "mode core|systems|ascii", key: "cmd.mode" },
  { cmd: "matrix", key: "cmd.matrix" },
  { cmd: "webcam [off]", key: "cmd.webcam" },
  { cmd: "coffee", key: "cmd.coffee" },
  { cmd: "sl", key: "cmd.sl" },
  { cmd: "screensaver", key: "cmd.screensaver" },
  { cmd: "vim", key: "cmd.vim" },
  { cmd: "poweroff", key: "cmd.poweroff" },
  { cmd: "clear", key: "cmd.clear" },
  { cmd: "exit", key: "cmd.exit" },
];

/** Líneas que escribe `open`/clic en pieza: la ficha de un proyecto. */
export function projectLines(project: (typeof projects)[number], lang: Lang): OutputLine[] {
  const b = (v: Bi) => v[lang];
  const lines: OutputLine[] = [
    { kind: "dim", text: `── ${project.name} ── ${b(project.org)} · ${project.year}` },
  ];
  if (project.flow) lines.push({ kind: "out", text: project.flow });
  lines.push({ kind: "out", text: "" });
  lines.push({ kind: "out", text: b(project.description) });
  project.highlights?.forEach((h) => lines.push({ kind: "dim", text: `├─ ${b(h)}` }));
  lines.push({ kind: "out", text: `[${project.tags.join("] [")}]` });
  return lines;
}

export function runCommand(input: string, ctx: CommandContext): CommandResult {
  const lang = ctx.lang;
  const t = (key: Parameters<typeof translate>[0], vars?: Record<string, string | number>) =>
    translate(key, lang, vars);
  const b = (v: Bi) => v[lang];

  const lines: OutputLine[] = [];
  const effects: CommandEffect[] = [];
  const out = (text: string) => lines.push({ kind: "out", text });
  const dim = (text: string) => lines.push({ kind: "dim", text });
  const err = (text: string) => lines.push({ kind: "err", text });
  const art = (text: string) => lines.push({ kind: "art", text });

  const parsed = parseCommand(input);
  if (!parsed) return { lines, effects };
  lines.push({ kind: "in", text: parsed.raw });
  const { name, arg } = parsed;

  switch (name) {
    case "help":
    case "?":
      HELP.forEach((h) => out(`  ${h.cmd.padEnd(18, " ")}${t(h.key)}`));
      return { lines, effects };

    case "ls":
      dim(`${t("term.sections")}/`);
      SECTIONS.forEach((s) => out(`  ${s.aliases[lang === "es" ? 1 : 0]}`));
      dim(`${t("term.projects")}/`);
      projects.forEach((p, i) => out(`  ${String(i + 1).padStart(2, " ")}  ${p.name}`));
      return { lines, effects };

    case "cd":
    case "goto": {
      if (!arg) {
        dim(`${t("term.usage")}: cd <${t("term.sections")}>`);
        return { lines, effects };
      }
      if (["/", "~", "inicio", "home", "top", "main"].includes(arg)) {
        effects.push({ type: "scroll", target: "top" });
        out(`${t("term.going")} /`);
        return { lines, effects };
      }
      const found = SECTIONS.find((s) => s.aliases.includes(arg));
      if (found) {
        effects.push({ type: "scroll", target: found.id });
        out(`${t("term.going")} /${arg}`);
      } else {
        err(t("term.noSection"));
      }
      return { lines, effects };
    }

    case "open": {
      const res = resolveProjectArg(arg, projects);
      if (res.kind === "usage") {
        dim(`${t("term.usage")}: open <1-${projects.length} | nombre>`);
        return { lines, effects };
      }
      if (res.kind === "not-found") {
        err(t("term.noProject"));
        return { lines, effects };
      }
      if (res.kind === "ambiguous") {
        dim(t("term.ambiguous"));
        res.candidates.forEach((p) => {
          const index = projects.indexOf(p);
          out(`  ${String(index + 1).padStart(2, " ")}  ${p.name}`);
        });
        return { lines, effects };
      }
      // La ficha se escribe acá; la lista abre su detalle y la escena
      // selecciona la pieza. No mueve la página: eso lo hace `cd`.
      effects.push({ type: "select-project", id: res.project.id });
      effects.push({ type: "open-project", id: res.project.id });
      lines.push(...projectLines(res.project, lang));
      return { lines, effects };
    }

    case "cat": {
      if (!arg || arg === "cat" || arg === "gato") {
        effects.push({ type: "cat", on: true });
        out(t("term.catOn"));
        return { lines, effects };
      }
      const file = arg.replace(/\.(txt|md)$/, "");
      const target = SECTIONS.find((sec) => sec.aliases.includes(file));

      if (target?.id === "about") {
        about.paragraphs.forEach((par) => {
          out(b(par));
          out("");
        });
        return { lines, effects };
      }
      if (target?.id === "work") {
        projects.forEach((proj, i) => {
          dim(`${String(i + 1).padStart(2, " ")}  ${proj.name}`);
          out(`    ${b(proj.tagline)}`);
        });
        return { lines, effects };
      }
      if (target?.id === "stack") {
        // Sin niveles inventados: cada tecnología con sus proyectos.
        buildExpertise(projects, stack).forEach((group) => {
          dim(`░▒▓ ${b(group.label)}`);
          group.items.forEach((item) => {
            const names = item.projectIds
              .map((id) => projects.find((p) => p.id === id)?.name ?? id)
              .join(", ");
            out(`  ${item.name.padEnd(12, " ")}${names}`);
          });
          out("");
        });
        return { lines, effects };
      }
      if (target?.id === "experience") {
        experience.forEach((job) => {
          const to = job.to === job.from ? "" : `—${job.to ?? t("experience.present")}`;
          dim(`${job.from}${to}  ${job.company}`);
          out(`  ${b(job.role)}`);
          job.bullets.forEach((bl) => out(`  ├─ ${b(bl)}`));
          out("");
        });
        return { lines, effects };
      }
      if (target?.id === "contact") {
        contactLinks.forEach((link) => out(`${link.label.padEnd(9, " ")}${link.value}`));
        return { lines, effects };
      }
      if (target?.id === "lab") {
        HELP.filter((h) =>
          ["matrix", "webcam", "coffee", "sl", "screensaver", "vim", "poweroff", "theme"].some(
            (c) => h.cmd.startsWith(c),
          ),
        ).forEach((h) => out(`  ${h.cmd.padEnd(18, " ")}${t(h.key)}`));
        return { lines, effects };
      }
      err(`cat: ${file}: ${t("term.unknown")}`);
      return { lines, effects };
    }

    case "nocat":
      effects.push({ type: "cat", on: false });
      out(t("term.catOff"));
      return { lines, effects };

    case "whoami":
      out(`${identity.name} — ${b(identity.role)}, ${b(identity.location)}`);
      return { lines, effects };

    case "neofetch":
      LOGO.forEach((row, i) => {
        const fields = [
          `${identity.handle}@seb.sys`,
          "─────────────────",
          `${b(identity.role)}`,
          `${projects.length} ${t("term.projects")}`,
        ];
        art(`  ${row}   ${fields[i] ?? ""}`);
      });
      return { lines, effects };

    case "lang":
      if (arg === "es" || arg === "en") {
        effects.push({ type: "set-lang", lang: arg });
        out(`lang = ${arg}`);
      } else {
        dim(`${t("term.usage")}: lang es|en`);
      }
      return { lines, effects };

    case "matrix":
      effects.push({ type: "effect", name: "matrix" });
      out("wake up…");
      return { lines, effects };

    case "webcam": {
      const off = arg === "off" || arg === "no" || arg === "stop";
      effects.push({ type: "webcam", on: !off });
      out(t(off ? "term.webcamOff" : "term.webcamOn"));
      return { lines, effects };
    }

    case "coffee":
      COFFEE.forEach(art);
      dim("418 — I'm a teapot");
      return { lines, effects };

    case "sudo":
      err(t("term.sudo"));
      return { lines, effects };

    case "rm":
      out(t("term.rm"));
      return { lines, effects };

    case "htop":
      dim(t("term.measuring"));
      effects.push({ type: "htop" });
      return { lines, effects };

    case "theme": {
      const amber = ["amber", "ambar", "ámbar"].includes(arg);
      const green = ["green", "verde"].includes(arg);
      if (!amber && !green) {
        dim(`${t("term.usage")}: theme green|amber`);
        return { lines, effects };
      }
      effects.push({ type: "theme", phosphor: amber ? "amber" : "green" });
      out(`phosphor = ${amber ? "amber" : "green"}`);
      return { lines, effects };
    }

    case "mode": {
      if (arg === "core" || arg === "systems" || arg === "ascii") {
        effects.push({ type: "scene-mode", mode: arg });
        out(`mode = ${arg}`);
        return { lines, effects };
      }
      dim(`${t("term.usage")}: mode core|systems|ascii`);
      return { lines, effects };
    }

    case "sl":
      effects.push({ type: "effect", name: "train" });
      return { lines, effects };

    case "screensaver":
    case "idle":
      effects.push({ type: "effect", name: "screensaver" });
      out(t("term.screensaver"));
      return { lines, effects };

    case "vim":
    case "vi":
      effects.push({ type: "effect", name: "vim" });
      return { lines, effects };

    case "poweroff":
    case "shutdown":
      effects.push({ type: "effect", name: "poweroff" });
      return { lines, effects };

    case "clear":
      effects.push({ type: "clear" });
      return { lines: [], effects };

    case "exit":
    case "q":
      effects.push({ type: "close" });
      return { lines, effects };

    default:
      err(`${name}: ${t("term.unknown")}`);
      dim(t("term.help"));
      return { lines, effects };
  }
}
