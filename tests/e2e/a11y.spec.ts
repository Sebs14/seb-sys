import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { gotoHome, waitScene } from "./helpers";

test.describe("A11Y-01: teclado, movimiento y semántica", () => {
  test("axe no encuentra violaciones serias o críticas", async ({ page }) => {
    await gotoHome(page);
    await waitScene(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });

  test("skip link, foco visible y recorrido con Tab hasta la lista de proyectos", async ({ page }) => {
    await gotoHome(page);
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /saltar al contenido|skip to main/i });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page).toHaveURL(/#main$/);
    // Recorrer hasta el primer chip de proyecto y elegirlo con teclado.
    const first = page.getByRole("group", { name: /elegir proyecto|pick a project/i }).getByRole("button").first();
    for (let i = 0; i < 40; i += 1) {
      if (await first.evaluate((el) => el === document.activeElement)) break;
      await page.keyboard.press("Tab");
    }
    await expect(first).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Tab");
    const second = page.getByRole("group", { name: /elegir proyecto|pick a project/i }).getByRole("button").nth(1);
    await expect(second).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(second).toHaveAttribute("aria-pressed", "true");
    // Mover el mouse sobre otro elemento no cambia la selección.
    await page.getByRole("group", { name: /elegir proyecto|pick a project/i }).getByRole("button").nth(4).hover();
    await expect(second).toHaveAttribute("aria-pressed", "true");
  });

  test("con movimiento reducido el texto final es visible y la escena se dibuja estática", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoHome(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/aguantan|hold up/);
    const box = await waitScene(page);
    const status = await box.getAttribute("data-status");
    if (status === "ready") {
      // Canvas con primer cuadro: sin trabajo continuo después.
      await page.waitForTimeout(1500);
      const a = await page.evaluate(() => window.__sebStats?.frames ?? -1);
      await page.waitForTimeout(1000);
      const b = await page.evaluate(() => window.__sebStats?.frames ?? -1);
      expect(a).toBeGreaterThan(0);
      expect(b - a).toBeLessThanOrEqual(2);
    }
    // Pausar queda deshabilitado: el sistema ya lo pide.
    await expect(page.getByRole("button", { name: /pausar movimiento|pause motion/i })).toBeDisabled();
  });

  test("cambiar reduced-motion con la página abierta no desmonta el contenido", async ({ page }) => {
    await gotoHome(page);
    await waitScene(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.getByRole("button", { name: /pausar movimiento|pause motion/i })).toBeDisabled();
    await expect(page.locator("#work")).toHaveCount(1);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(page.getByRole("button", { name: /pausar movimiento|pause motion/i })).toBeEnabled();
  });

  test("la terminal anuncia con role=log y devuelve el foco", async ({ page }) => {
    await gotoHome(page);
    const opener = page.locator("[data-terminal-opener]");
    await opener.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("log")).toHaveCount(1);
    await expect(page.getByRole("complementary", { name: /terminal/i })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
  });
});

test.describe("BUG-08: móvil", () => {
  test.skip(({ isMobile }) => !isMobile, "sólo móvil");

  test("menú móvil por teclado, sin overflow horizontal y controles ≥ 44 px", async ({ page }) => {
    await gotoHome(page);
    const menu = page.getByRole("button", { name: /menú|menu/i });
    await menu.focus();
    await page.keyboard.press("Enter");
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    const link = page.getByRole("navigation").last().getByRole("link", { name: /experiencia|experience/i });
    await expect(link).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toBeFocused();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    const small = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("header button, header a, .segmented button")]
        .filter((el) => el.offsetParent !== null)
        .map((el) => ({ h: el.getBoundingClientRect().height, t: el.textContent?.trim() }))
        .filter((r) => r.h < 44),
    );
    expect(small).toEqual([]);
  });
});
