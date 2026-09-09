/* ══════════════════════════════════════════════════════════════
   PARSEO DE COMANDOS — sin efectos

   Separar la lectura del comando de su ejecución hace posible probar
   los casos raros (`open`, `open 0`, `open 1abc`) sin montar React.
   ══════════════════════════════════════════════════════════════ */

export type ParsedCommand = {
  name: string;
  /** argumentos tal como se escribieron */
  args: string[];
  /** argumentos unidos y en minúsculas, para comparar */
  arg: string;
  raw: string;
};

export function parseCommand(input: string): ParsedCommand | null {
  const raw = input.trim();
  if (!raw) return null;
  const [name, ...args] = raw.split(/\s+/);
  return {
    name: name.toLowerCase(),
    args,
    arg: args.join(" ").toLowerCase(),
    raw,
  };
}

export type ProjectRef = { id: string; name: string };

export type ProjectResolution<T extends ProjectRef> =
  | { kind: "usage" }
  | { kind: "not-found" }
  | { kind: "ambiguous"; candidates: T[] }
  | { kind: "found"; project: T; index: number };

/**
 * Resuelve el argumento de `open`. Un número entero (1-based) elige por
 * orden; cualquier otra cosa busca por id o por nombre. Un argumento
 * vacío pide el uso — no elige el primero porque "" está en todo nombre.
 * `1abc` no es un número: se trata como texto y no encuentra nada.
 */
export function resolveProjectArg<T extends ProjectRef>(
  arg: string,
  projects: readonly T[],
): ProjectResolution<T> {
  const needle = arg.trim().toLowerCase();
  if (!needle) return { kind: "usage" };

  if (/^\d+$/.test(needle)) {
    const n = Number.parseInt(needle, 10);
    if (n < 1 || n > projects.length) return { kind: "not-found" };
    return { kind: "found", project: projects[n - 1], index: n - 1 };
  }

  const exact = projects.findIndex(
    (p) => p.id.toLowerCase() === needle || p.name.toLowerCase() === needle,
  );
  if (exact >= 0) return { kind: "found", project: projects[exact], index: exact };

  const matches = projects
    .map((p, index) => ({ p, index }))
    .filter(({ p }) => p.name.toLowerCase().includes(needle) || p.id.includes(needle));

  if (matches.length === 0) return { kind: "not-found" };
  if (matches.length > 1) return { kind: "ambiguous", candidates: matches.map((m) => m.p) };
  return { kind: "found", project: matches[0].p, index: matches[0].index };
}
