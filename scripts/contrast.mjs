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
const surfaces = { base: "#090b0d", section: "#111417", raised: "#1a1e22" };
const tokens = {
  ink: "#f5f6f7", "ink-2": "#b8bec5", "ink-3": "#8f99a3", accent: "#9ef5b5",
  "accent-strong": "#54df86", amber: "#ffd28b", error: "#ff9d9d", "phosphor-dim": "#3f9a63", stroke: "#303840",
};
for (const [name, hex] of Object.entries(tokens)) {
  console.log(name.padEnd(14), ...Object.entries(surfaces).map(([s, sh]) => `${s} ${ratio(hex, sh)}`));
}
console.log("base on accent", ratio(surfaces.base, tokens.accent));
