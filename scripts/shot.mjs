/* Captura una URL a varios tamaños. Uso:
   node scripts/shot.mjs <url> <carpeta> [nombre] [--full]
   Es una herramienta de evidencia, no parte del sitio. */
import { chromium } from "@playwright/test";
import path from "node:path";

const [url, outDir, name = "shot", ...flags] = process.argv.slice(2);
const full = flags.includes("--full");
const sizes = [
  ["desktop-1440", 1440, 900],
  ["desktop-1280", 1280, 800],
  ["tablet-768", 768, 1024],
  ["mobile-390", 390, 844],
  ["mobile-320", 320, 740],
];
const browser = await chromium.launch();
for (const [label, width, height] of sizes) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const file = path.join(outDir, `${name}-${label}.png`);
  await page.screenshot({ path: file, fullPage: full });
  console.log(file);
  await page.close();
}
await browser.close();
