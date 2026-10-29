/* Relación de contraste WCAG entre los tokens y las superficies. */
const lum = (h) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(1 + i, 3 + i), 16) / 255);
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return ((hi + 0.05) / (lo + 0.05)).toFixed(2);
};
const surfaces = { base: "#000000", section: "#060607", raised: "#0b0b0e" };
const tokens = {
  ink: "#f5f5f7", "ink-2": "#a1a1a8", "ink-3": "#85858c", accent: "#5b8cff",
  "accent-soft": "#b6d6ff", amber: "#ffd28b", error: "#ff9d9d", "phosphor-dim": "#3f9a63", stroke: "#1f1f24",
};
for (const [name, hex] of Object.entries(tokens)) {
  console.log(name.padEnd(14), ...Object.entries(surfaces).map(([s, sh]) => `${s} ${ratio(hex, sh)}`));
}
console.log("primary text on ink", ratio("#0b0b10", tokens.ink));
