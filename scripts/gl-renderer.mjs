/* Imprime el renderer WebGL que ve Chromium con distintos flags. */
import { chromium } from "@playwright/test";
const sets = {
  default: [],
  metal: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"],
  swiftshader: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
};
for (const [name, args] of Object.entries(sets)) {
  const b = await chromium.launch({ args, headless: true });
  const p = await b.newPage();
  const r = await p.evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2");
    if (!gl) return "no webgl2";
    const d = gl.getExtension("WEBGL_debug_renderer_info");
    return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  });
  console.log(name, "→", r);
  await b.close();
}
