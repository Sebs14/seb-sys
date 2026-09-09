/* Capturas por sección (elemento) a dos anchos. Uso:
   node scripts/shot-sections.mjs <url> <carpeta> <prefijo> */
import { chromium } from "@playwright/test";
import path from "node:path";

const [url, outDir, name = "sec"] = process.argv.slice(2);
const sizes = [["d", 1440, 900], ["m", 390, 844]];
const sections = ["#work", "#about", "#stack", "#experience", "#lab", "#contact"];
const browser = await chromium.launch();
for (const [label, width, height] of sizes) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  for (const sel of sections) {
    const el = page.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const file = path.join(outDir, `${name}-${label}-${sel.slice(1)}.png`);
    await el.screenshot({ path: file });
    console.log(file);
  }
  await page.close();
}
await browser.close();
