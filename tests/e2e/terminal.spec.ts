import { test, expect } from "@playwright/test";
import { gotoHome } from "./helpers";

async function openTerminal(page: import("@playwright/test").Page) {
  await page.locator("[data-terminal-opener]").click();
  const input = page.getByRole("textbox", { name: /línea de comandos|command line/i });
  await expect(input).toBeFocused();
  return input;
}

test.describe("TERM-01: regresiones de terminal", () => {
  test("help, ↓, ↑ devuelve help; las flechas nunca salen del rango", async ({ page }) => {
    await gotoHome(page);
    const input = await openTerminal(page);
    await input.fill("help");
    await input.press("Enter");
    await input.press("ArrowDown");
    await input.press("ArrowDown");
    await input.press("ArrowUp");
    await expect(input).toHaveValue("help");
    await input.press("ArrowUp");
    await expect(input).toHaveValue("help");
    await input.press("ArrowDown");
    await expect(input).toHaveValue("");
  });

  test("el borrador se recupera al salir del historial", async ({ page }) => {
    await gotoHome(page);
    const input = await openTerminal(page);
    await input.fill("whoami");
    await input.press("Enter");
    await input.fill("borra");
    await input.press("ArrowUp");
    await expect(input).toHaveValue("whoami");
    await input.press("ArrowDown");
    await expect(input).toHaveValue("borra");
  });

  test("open 1 imprime y abre; open, open 0, open 99 y open 1abc muestran uso/error", async ({ page }) => {
    await gotoHome(page);
    const input = await openTerminal(page);
    const log = page.getByRole("log");
    await input.fill("open 1");
    await input.press("Enter");
    await expect(log).toContainText("Evaluación de fluidez lectora ──", { timeout: 10_000 });
    await expect(page.locator("#project-fluidez-lectora").getByRole("button", { expanded: true })).toHaveCount(1);
    for (const cmd of ["open", "open 0", "open 99", "open 1abc"]) {
      await input.fill(cmd);
      await input.press("Enter");
    }
    await expect(log).toContainText(/uso|usage/);
    await expect(log.locator(".ln-err")).toHaveCount(3, { timeout: 10_000 });
  });

  test("cd, cat, lang, clear y exit conservan su intención", async ({ page }) => {
    await gotoHome(page);
    const input = await openTerminal(page);
    const log = page.getByRole("log");
    await input.fill("cd proyectos");
    await input.press("Enter");
    await expect(page).toHaveURL(/#work$/);
    await input.fill("cat contacto");
    await input.press("Enter");
    await expect(log).toContainText("EMAIL", { timeout: 10_000 });
    await input.fill("lang en");
    await input.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await input.fill("lang es");
    await input.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    // clear durante el tipeo cancela lo pendiente.
    await input.fill("cat stack");
    await input.press("Enter");
    await input.fill("clear");
    await input.press("Enter");
    await page.waitForTimeout(600);
    await expect(log).not.toContainText("Next.js");
    await expect(log).toHaveText(/^\s*$/);
    await input.fill("exit");
    await input.press("Enter");
    await expect(page.getByRole("complementary", { name: /terminal/i })).toHaveCount(0);
    // Foco de vuelta al control que la abrió.
    await expect(page.locator("[data-terminal-opener]")).toBeFocused();
  });

  test("theme amber cambia el fósforo y sigue legible; Escape cierra y devuelve el foco", async ({ page }) => {
    await gotoHome(page);
    const input = await openTerminal(page);
    await input.fill("theme amber");
    await input.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-phosphor", "amber");
    await input.fill("theme green");
    await input.press("Enter");
    await expect(page.locator("html")).not.toHaveAttribute("data-phosphor", /.+/);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("complementary", { name: /terminal/i })).toHaveCount(0);
    await expect(page.locator("[data-terminal-opener]")).toBeFocused();
  });

  test("vim se puede cerrar y deja el sitio funcional", async ({ page }) => {
    await gotoHome(page);
    const input = await openTerminal(page);
    await input.fill("vim");
    await input.press("Enter");
    const dialog = page.getByRole("dialog", { name: "vim" });
    await expect(dialog).toBeVisible();
    await page.keyboard.type(":q!");
    await page.keyboard.press("Enter");
    await expect(dialog).toHaveCount(0);
    await expect(input).toBeVisible();
    await input.fill("htop");
    await input.press("Enter");
    await expect(page.getByRole("log")).toContainText(/scene fps|scene/, { timeout: 10_000 });
  });
});
