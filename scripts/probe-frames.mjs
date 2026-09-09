/* Evidencia de rendimiento: cuadros renderizados, draw calls y
   triángulos por modo, leídos de window.__sebStats en un Chromium con
   SwiftShader (software) o con la GPU real si se pasa --gpu.
   Uso: node scripts/probe-frames.mjs [url] [--gpu] */
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith("--")) ?? "http://localhost:4173/seb-sys/";
const gpu = args.includes("--gpu");
// Con --gpu se usa la GPU real vía ANGLE/Metal (macOS) en headless.
const browser = await chromium.launch({
  headless: true,
  args: gpu
    ? ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"]
    : ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: gpu ? 2 : 1 });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForSelector('.scene-box[data-status="ready"]', { timeout: 30_000 });

const stats = () => page.evaluate(() => {
  const s = window.__sebStats;
  return { frames: s.frames, drawCalls: s.drawCalls, triangles: s.triangles, dpr: s.dpr, quality: s.quality, mode: s.mode, cells: s.asciiCells, inv: { ...s.invalidations } };
});
const settle = async () => {
  let last = -1;
  for (let i = 0; i < 20; i += 1) {
    await page.waitForTimeout(500);
    const f = (await stats()).frames;
    if (f === last) return;
    last = f;
  }
};
const fpsDuring = async (ms) => {
  const a = (await stats()).frames;
  const t0 = Date.now();
  await page.waitForTimeout(ms);
  const b = (await stats()).frames;
  return Math.round(((b - a) * 1000) / (Date.now() - t0));
};

const out = [];
for (const mode of ["core", "systems", "ascii"]) {
  await page.getByRole("group", { name: /presentación|presentation/i }).getByRole("button", { name: mode === "core" ? /núcleo|core/i : mode === "systems" ? /sistemas|systems/i : /ascii/i }).click();
  const fps = await fpsDuring(900); // durante la transición
  await settle();
  const s = await stats();
  out.push({ mode, fpsDuringTransition: fps, drawCalls: s.drawCalls, triangles: s.triangles, dpr: s.dpr, quality: s.quality, asciiCells: s.cells });
}
// arrastre: fps mientras se gira
const box = await page.locator(".scene-box").boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
const a = (await stats()).frames;
const t0 = Date.now();
for (let i = 0; i < 30; i += 1) {
  await page.mouse.move(box.x + box.width / 2 + i * 8, box.y + box.height / 2 + i * 2);
  await page.waitForTimeout(16);
}
await page.mouse.up();
const b = (await stats()).frames;
out.push({ drag: true, fpsWhileDragging: Math.round(((b - a) * 1000) / (Date.now() - t0)) });
await settle();
const renderer = await page.evaluate(() => {
  const gl = document.querySelector("canvas")?.getContext("webgl2");
  const d = gl?.getExtension("WEBGL_debug_renderer_info");
  return gl && d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : "n/d";
});
out.push({ idleAfterSettle: await fpsDuring(1500), renderer, dpr: (await stats()).dpr, viewport: "1440×900" });
console.log(JSON.stringify(out, null, 2));
await browser.close();
