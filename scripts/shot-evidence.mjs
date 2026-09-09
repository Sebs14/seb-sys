/* Evidencia final: portada escritorio/móvil, Sistemas, ASCII, proyecto
   abierto, terminal, fallback sin WebGL y zoom 200 %.
   Uso: node scripts/shot-evidence.mjs [url] [carpeta] */
import { chromium } from "@playwright/test";
import path from "node:path";

const [url = "http://localhost:4173/seb-sys/", outDir = "docs/evidence/final"] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const shot = (page, name) => page.screenshot({ path: path.join(outDir, `${name}.png`) }).then(() => console.log(name));
const ready = (page) => page.waitForSelector('.scene-box[data-status="ready"], .scene-box[data-status="unsupported"]', { timeout: 30_000 });
const settle = (page) => page.waitForTimeout(3500);

for (const [label, width, height] of [["desktop-1440", 1440, 900], ["desktop-1280", 1280, 800], ["tablet-768", 768, 1024], ["mobile-390", 390, 844], ["mobile-320", 320, 740]]) {
  const page = await browser.newPage({ viewport: { width, height }, locale: "es-SV" });
  await page.goto(url, { waitUntil: "networkidle" });
  await ready(page);
  await settle(page);
  await shot(page, `hero-${label}`);
  if (label === "desktop-1440" || label === "mobile-390") {
    await page.getByRole("group", { name: /presentación/i }).getByRole("button", { name: /sistemas/i }).click();
    await settle(page);
    await shot(page, `systems-${label}`);
    await page.getByRole("group", { name: /presentación/i }).getByRole("button", { name: /ascii/i }).click();
    await settle(page);
    await shot(page, `ascii-${label}`);
    await page.getByRole("group", { name: /presentación/i }).getByRole("button", { name: /núcleo/i }).click();
    await page.getByRole("group", { name: /elegir proyecto/i }).getByRole("button", { name: /Motor de gamificación/ }).click();
    await page.getByRole("button", { name: /ver proyecto/i }).click();
    await page.waitForTimeout(900);
    await shot(page, `project-open-${label}`);
    await page.locator("[data-terminal-opener]").click();
    const input = page.getByRole("textbox", { name: /línea de comandos/i });
    for (const cmd of ["help", "open 2", "htop"]) {
      await input.fill(cmd);
      await input.press("Enter");
      await page.waitForTimeout(1400);
    }
    await shot(page, `terminal-${label}`);
    await page.keyboard.press("Escape");
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await page.locator("#lab").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await shot(page, `lab-${label}`);
  }
  await page.close();
}

// Sin WebGL 2: fallback.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: "es-SV" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (type === "webgl2" || type === "webgl") return null;
      return original.call(this, type, ...rest);
    };
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await ready(page);
  await page.waitForTimeout(800);
  await shot(page, "fallback-no-webgl");
  await page.close();
}

// Zoom 200 %: viewport lógico de 720×450 equivale a 1440×900 al 200 %.
{
  const page = await browser.newPage({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2, locale: "es-SV" });
  await page.goto(url, { waitUntil: "networkidle" });
  await ready(page);
  await settle(page);
  await shot(page, "zoom-200-hero");
  await page.close();
}

// Movimiento reducido.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: "es-SV", reducedMotion: "reduce" });
  await page.goto(url, { waitUntil: "networkidle" });
  await ready(page);
  await page.waitForTimeout(600);
  await shot(page, "reduced-motion-hero");
  await page.close();
}
await browser.close();
