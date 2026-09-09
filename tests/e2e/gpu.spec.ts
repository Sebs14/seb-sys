import { test, expect } from "@playwright/test";
import { gotoHome, waitScene } from "./helpers";

test.describe("GPU-01: degradación y recuperación", () => {
  test("sin WebGL 2: fallback completo y contenido operable, sin error global", async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (type === "webgl2" || type === "webgl" || type === "experimental-webgl") return null;
        return (original as (this: HTMLCanvasElement, ...a: unknown[]) => unknown).call(this, type, ...rest);
      } as typeof HTMLCanvasElement.prototype.getContext;
    });
    await gotoHome(page);
    const box = page.locator(".scene-box");
    await expect(box).toHaveAttribute("data-status", "unsupported", { timeout: 15_000 });
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(box.getByRole("status")).toContainText(/WebGL/);
    await expect(box.getByRole("img")).toBeVisible();
    // Todo lo demás sigue: elegir proyecto y llegar a contacto.
    await page.getByRole("group", { name: /elegir proyecto|pick a project/i }).getByRole("button", { name: /TP Rental/ }).click();
    await expect(page.locator('[aria-live="polite"][aria-atomic="true"] h2')).toHaveText("TP Rental");
    await page.getByRole("link", { name: /contactarme|get in touch/i }).click();
    await expect(page.locator("#contact")).toBeInViewport();
    await expect(page.getByText(/Application error|Unhandled Runtime Error/)).toHaveCount(0);
  });

  test("pérdida de contexto: fallback, reintento y la escena vuelve a dibujar", async ({ page }) => {
    await gotoHome(page);
    const box = await waitScene(page);
    test.skip((await box.getAttribute("data-status")) !== "ready", "sin GPU en este entorno");

    const before = await page.evaluate(() => window.__sebStats?.frames ?? 0);
    await page.evaluate(() => {
      const canvas = document.querySelector("canvas")!;
      const gl = canvas.getContext("webgl2")!;
      gl.getExtension("WEBGL_lose_context")!.loseContext();
    });
    await expect(box).toHaveAttribute("data-status", /recovering|loading/, { timeout: 5_000 });
    await expect(box).toHaveAttribute("data-status", "ready", { timeout: 15_000 });
    await expect(page.locator("canvas")).toHaveCount(1);
    // Cuadros nuevos después de recuperar: la escena está dibujando de verdad.
    await expect
      .poll(async () => page.evaluate(() => window.__sebStats?.frames ?? 0), { timeout: 5_000 })
      .toBeGreaterThan(before);
    // El contenido no se perdió.
    await expect(page.locator("#work")).toHaveCount(1);
    await expect(page.locator("#contact")).toHaveCount(1);
  });

  test("segunda pérdida persistente: sin reintentos infinitos, botón Reintentar disponible", async ({ page }) => {
    await gotoHome(page);
    const box = await waitScene(page);
    test.skip((await box.getAttribute("data-status")) !== "ready", "sin GPU en este entorno");

    const lose = () =>
      page.evaluate(() => {
        const canvas = document.querySelector("canvas");
        const gl = canvas?.getContext("webgl2");
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
      });
    await lose();
    await expect(box).toHaveAttribute("data-status", "ready", { timeout: 15_000 });
    await lose();
    await expect(box).toHaveAttribute("data-status", "failed", { timeout: 5_000 });
    const retry = page.getByRole("button", { name: /reintentar 3d|retry 3d/i });
    await expect(retry).toBeVisible();
    await retry.click();
    await expect(box).toHaveAttribute("data-status", "ready", { timeout: 15_000 });
  });

  test("fuera del viewport la escena deja de dibujar y al volver revalida", async ({ page }) => {
    await gotoHome(page);
    const box = await waitScene(page);
    test.skip((await box.getAttribute("data-status")) !== "ready", "sin GPU en este entorno");
    const frames = () => page.evaluate(() => window.__sebStats?.frames ?? 0);
    await page.locator("#experience").scrollIntoViewIfNeeded();
    // El bucle pasa a "never" y los cuadros en vuelo terminan.
    await expect.poll(() => page.evaluate(() => window.__sebStats?.frameloop), { timeout: 5_000 }).toBe("never");
    let last = await frames();
    await expect
      .poll(
        async () => {
          const now = await frames();
          const quiet = now === last;
          last = now;
          return quiet;
        },
        { timeout: 10_000, intervals: [700] },
      )
      .toBe(true);
    const a = await frames();
    // Pedir movimiento mientras está fuera de pantalla no debe dibujar.
    await page.evaluate(() =>
      window.dispatchEvent(new CustomEvent("seb.sys", { detail: { type: "scene-mode", mode: "systems" } })),
    );
    await page.waitForTimeout(1000);
    const b = await frames();
    // En software (SwiftShader) puede colarse un cuadro ya encolado; con
    // GPU real la diferencia medida es 0 (docs/evidence/perf-gpu-metal.json).
    expect(b - a).toBeLessThanOrEqual(1);
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await expect.poll(frames, { timeout: 8_000 }).toBeGreaterThan(b);
  });
});
