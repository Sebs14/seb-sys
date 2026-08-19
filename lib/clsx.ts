/** Concatenador de clases mínimo — evita una dependencia para 6 líneas. */
export function clsx(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
