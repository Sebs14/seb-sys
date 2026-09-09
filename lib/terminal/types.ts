export type LineKind = "in" | "out" | "dim" | "art" | "err";

export type OutputLine = { kind: LineKind; text: string };

/** Lo que un comando le pide al mundo exterior. La terminal lo aplica. */
export type CommandEffect =
  | { type: "scroll"; target: string | "top" }
  | { type: "open-project"; id: string }
  | { type: "select-project"; id: string }
  | { type: "print-project"; id: string }
  | { type: "scene-mode"; mode: "core" | "systems" | "ascii" }
  | { type: "set-lang"; lang: "es" | "en" }
  | { type: "theme"; phosphor: "green" | "amber" }
  | { type: "cat"; on: boolean }
  | { type: "effect"; name: "matrix" | "train" | "vim" | "poweroff" | "screensaver" }
  | { type: "webcam"; on: boolean }
  | { type: "htop" }
  | { type: "clear" }
  | { type: "close" };

export type CommandResult = {
  lines: OutputLine[];
  effects: CommandEffect[];
};
