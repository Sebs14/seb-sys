/* Genera los iconos y la imagen social A PARTIR DEL RESULTADO REAL:
   - app/apple-icon.png (180×180) rasterizando app/icon.svg
   - app/opengraph-image.png (1200×630) capturando la portada servida,
     con GPU real para que el titular líquido salga en WebGL
   Uso: node scripts/make-assets.mjs <url-de-la-portada> */
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const [url = "http://localhost:4173/seb-sys/"] = process.argv.slice(2);
const browser = await chromium.launch({
  args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"],
});

const icon = await browser.newPage({ viewport: { width: 180, height: 180 }, deviceScaleFactor: 1 });
const svg = readFileSync(new URL("../app/icon.svg", import.meta.url), "utf8");
await icon.setContent(`<html><body style="margin:0;background:#000000">${svg.replace('width="64" height="64"', 'width="180" height="180"')}</body></html>`);
await icon.screenshot({ path: "app/apple-icon.png", omitBackground: false });
console.log("app/apple-icon.png");

const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, locale: "es-SV" });
await og.goto(url, { waitUntil: "networkidle" });
// El titular en WebGL si hay GPU; si no, el degradado CSS ya es la portada.
await og.waitForSelector(".hero .liquid[data-live]", { timeout: 8_000 }).catch(() => {});
await og.waitForTimeout(1200);
// Sin la barra flotante: la imagen social es la portada, no la interfaz.
await og.addStyleTag({ content: "header{visibility:hidden} [data-terminal-opener]{display:none} .hero{min-height:630px;padding-block:0}" });
await og.waitForTimeout(300);
await og.screenshot({ path: "app/opengraph-image.png" });
console.log("app/opengraph-image.png");
await browser.close();
