import { test, expect } from "@playwright/test";
import { gotoHome, modeButton, waitScene } from "./helpers";

test.describe("INT-01 / INT-02: selección y modos", () => {
  test("los siete proyectos se eligen desde la lista DOM y la ficha cambia", async ({ page }) => {
    await gotoHome(page);
    const group = page.getByRole("group", { name: /elegir proyecto|pick a project/i });
    const buttons = group.getByRole("button");
    await expect(buttons).toHaveCount(7);
    const preview = page.locator('[aria-live="polite"][aria-atomic="true"]');
    for (let i = 0; i < 7; i += 1) {
      const btn = buttons.nth(i);
      const label = (await btn.getAttribute("aria-label")) ?? "";
      const name = label.split(" — ")[0];
      await btn.click();
      await expect(btn).toHaveAttribute("aria-pressed", "true");
      await expect(preview.getByRole("heading", { level: 2 })).toHaveText(name);
      await expect(preview).toContainText(/pieza \d de 7|piece \d of 7/);
    }
  });

  test("Ver proyecto abre y enfoca el detalle correcto; el idioma no lo cierra", async ({ page }) => {
    await gotoHome(page);
    const group = page.getByRole("group", { name: /elegir proyecto|pick a project/i });
    await group.getByRole("button", { name: /TP Rental/ }).click();
    await page.getByRole("button", { name: /ver proyecto|view project/i }).click();
    const heading = page.locator("#project-tp-rental h3").first();
    await expect(heading).toBeFocused();
    await expect(heading).toBeInViewport();
    const toggle = page.locator("#project-tp-rental").getByRole("button", { expanded: true });
    await expect(toggle).toHaveCount(1);
    // Cambiar de idioma conserva el detalle abierto.
    await page.getByRole("button", { name: /idioma|language/i }).click();
    await expect(page.locator("#project-tp-rental").getByRole("button", { expanded: true })).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("Núcleo / Sistemas / ASCII tienen estado accesible y el último clic manda", async ({ page }) => {
    await gotoHome(page);
    await waitScene(page);
    const core = modeButton(page, /núcleo|core/i);
    const systems = modeButton(page, /sistemas|systems/i);
    const ascii = modeButton(page, /ascii/i);
    await expect(core).toHaveAttribute("aria-pressed", "true");
    await systems.click();
    await ascii.click();
    await core.click();
    await systems.click();
    await expect(systems).toHaveAttribute("aria-pressed", "true");
    await expect(core).toHaveAttribute("aria-pressed", "false");
    await expect(ascii).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("canvas")).toHaveCount(1);
    await ascii.click();
    await expect(ascii).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("canvas")).toHaveCount(1);
  });

  test("Pausar y Restablecer siguen permitiendo elegir proyectos", async ({ page }) => {
    await gotoHome(page);
    await waitScene(page);
    const pause = page.getByRole("button", { name: /pausar movimiento|pause motion/i });
    await pause.click();
    await expect(page.getByRole("button", { name: /reanudar|resume/i })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: /restablecer vista|reset view/i }).click();
    const group = page.getByRole("group", { name: /elegir proyecto|pick a project/i });
    await group.getByRole("button", { name: /seb\.sys/ }).click();
    await expect(page.locator('[aria-live="polite"][aria-atomic="true"] h2')).toHaveText("seb.sys");
  });

  test("la escena reposa tras la interacción (render a demanda)", async ({ page }) => {
    await gotoHome(page);
    const box = await waitScene(page);
    test.skip((await box.getAttribute("data-status")) !== "ready", "sin GPU en este entorno");
    const frames = () => page.evaluate(() => window.__sebStats?.frames ?? -1);
    // Esperar a que la entrada asiente: primero que arranque de verdad
    // (los shaders compilan lento en software) y luego dos segundos
    // seguidos sin cuadros nuevos.
    await expect.poll(frames, { timeout: 20_000 }).toBeGreaterThan(30);
    let last = await frames();
    let quietPolls = 0;
    await expect
      .poll(
        async () => {
          const now = await frames();
          quietPolls = now === last ? quietPolls + 1 : 0;
          last = now;
          return quietPolls >= 2;
        },
        { timeout: 25_000, intervals: [1000] },
      )
      .toBe(true);
    const a = await frames();
    await page.waitForTimeout(1500);
    const b = await frames();
    expect(a).toBeGreaterThan(0);
    expect(b - a).toBe(0);
    // Una interacción vuelve a pedir cuadros.
    await page.getByRole("group", { name: /elegir proyecto|pick a project/i }).getByRole("button", { name: /TP Rental/ }).click();
    await expect.poll(frames, { timeout: 5_000 }).toBeGreaterThan(b);
  });
});
