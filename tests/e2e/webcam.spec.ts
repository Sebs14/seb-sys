import { test, expect } from "@playwright/test";
import { gotoHome, waitScene } from "./helpers";

/* Chromium corre con --use-fake-device-for-media-stream y
   --use-fake-ui-for-media-stream (playwright.config.ts): hay una cámara
   simulada y el permiso se concede sin diálogo. */
test.describe("CAM-01: webcam", () => {
  test("no se pide la cámara al cargar ni al cambiar a ASCII", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __gum: number }).__gum = 0;
      const md = navigator.mediaDevices;
      if (!md) return;
      const original = md.getUserMedia.bind(md);
      md.getUserMedia = (c) => {
        (window as unknown as { __gum: number }).__gum += 1;
        return original(c);
      };
    });
    await gotoHome(page);
    await waitScene(page);
    await page.getByRole("group", { name: /presentación|presentation/i }).getByRole("button", { name: /ascii/i }).click();
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => (window as unknown as { __gum: number }).__gum)).toBe(0);
  });

  test("activar y detener diez veces: pistas finalizadas y texturas al nivel base", async ({ page }) => {
    // Sin scroll suave: la prueba mide limpieza de recursos, no movimiento.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoHome(page);
    const box = await waitScene(page);
    test.skip((await box.getAttribute("data-status")) !== "ready", "sin GPU en este entorno");

    // Interceptar streams para poder comprobar que se detienen.
    await page.evaluate(() => {
      const w = window as unknown as { __tracks: MediaStreamTrack[] };
      w.__tracks = [];
      const md = navigator.mediaDevices;
      const original = md.getUserMedia.bind(md);
      md.getUserMedia = async (c) => {
        const s = await original(c);
        w.__tracks.push(...s.getTracks());
        return s;
      };
    });

    const textures = () => page.evaluate(() => window.__sebStats?.textures ?? -1);
    // Las estadísticas se actualizan por cuadro: leer con la escena en
    // pantalla y sólo cuando dos lecturas seguidas coinciden.
    const stable = async () => {
      await page.evaluate(() => window.scrollTo({ top: 0 }));
      let last = await textures();
      let quiet = 0;
      await expect
        .poll(
          async () => {
            const now = await textures();
            quiet = now === last ? quiet + 1 : 0;
            last = now;
            return quiet >= 2;
          },
          { timeout: 15_000, intervals: [700] },
        )
        .toBe(true);
      return last;
    };
    const idle = await stable();
    const camera = page.locator("#lab").getByRole("button", { name: /usar cámara|use camera/i });
    await camera.scrollIntoViewIfNeeded();
    await camera.click();
    await expect(page.locator("#lab").getByRole("button", { name: /detener cámara|stop camera/i })).toBeVisible({ timeout: 10_000 });
    // La textura de video existe cuando el primer cuadro con cámara se dibujó.
    const baseline = await stable();
    expect(baseline).toBeGreaterThan(idle);

    for (let i = 0; i < 9; i += 1) {
      await page.locator("#lab").getByRole("button", { name: /detener cámara|stop camera/i }).click();
      await expect(page.locator("#lab").getByRole("button", { name: /usar cámara|use camera/i })).toBeVisible();
      await page.locator("#lab").getByRole("button", { name: /usar cámara|use camera/i }).click();
      await expect(page.locator("#lab").getByRole("button", { name: /detener cámara|stop camera/i })).toBeVisible({ timeout: 10_000 });
    }
    await page.locator("#lab").getByRole("button", { name: /detener cámara|stop camera/i }).click();
    await expect(page.locator("#lab").getByRole("button", { name: /usar cámara|use camera/i })).toBeVisible();
    const after = await stable();

    const ended = await page.evaluate(() => {
      const w = window as unknown as { __tracks: MediaStreamTrack[] };
      return { total: w.__tracks.length, live: w.__tracks.filter((t) => t.readyState === "live").length };
    });
    expect(ended.total).toBe(10);
    expect(ended.live).toBe(0);

    // Con la cámara apagada la textura de video se liberó; el render
    // target y el atlas son caches estables y se quedan.
    expect(after).toBeLessThanOrEqual(baseline - 1);
  });

  test("salir durante el permiso pendiente no deja un stream vivo", async ({ page }) => {
    await gotoHome(page);
    const box = await waitScene(page);
    test.skip((await box.getAttribute("data-status")) !== "ready", "sin GPU en este entorno");
    await page.evaluate(() => {
      const w = window as unknown as { __tracks: MediaStreamTrack[] };
      w.__tracks = [];
      const md = navigator.mediaDevices;
      const original = md.getUserMedia.bind(md);
      md.getUserMedia = async (c) => {
        // Permiso lento: resuelve después de que el usuario ya salió.
        await new Promise((r) => setTimeout(r, 700));
        const s = await original(c);
        w.__tracks.push(...s.getTracks());
        return s;
      };
    });
    const lab = page.locator("#lab");
    await lab.getByRole("button", { name: /usar cámara|use camera/i }).scrollIntoViewIfNeeded();
    await lab.getByRole("button", { name: /usar cámara|use camera/i }).click();
    await page.waitForTimeout(150);
    await lab.getByRole("button", { name: /detener cámara|stop camera/i }).click();
    await page.waitForTimeout(1500);
    const live = await page.evaluate(() =>
      (window as unknown as { __tracks: MediaStreamTrack[] }).__tracks.filter((t) => t.readyState === "live").length,
    );
    expect(live).toBe(0);
  });
});
