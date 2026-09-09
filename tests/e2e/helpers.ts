import { expect, type Page } from "@playwright/test";

export async function gotoHome(page: Page, hash = "") {
  await page.goto(`/${hash}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

/** Espera a que la escena esté lista o declare que no puede. */
export async function waitScene(page: Page) {
  const box = page.locator(".scene-box");
  await expect(box).toHaveAttribute("data-status", /ready|unsupported|failed/, { timeout: 20_000 });
  return box;
}

export const modeButton = (page: Page, name: RegExp) =>
  page.getByRole("group", { name: /presentación|presentation/i }).getByRole("button", { name });
