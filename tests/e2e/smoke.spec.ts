import { test, expect } from "@playwright/test";
import { gotoHome, waitScene } from "./helpers";

test.describe("RELEASE-01 / INT-01: navegación y export bajo /seb-sys", () => {
  test("el HTML inicial trae nombre, proyectos y contacto sin esperar la GPU", async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/`);
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain("Sebastián Flores");
    expect(html).toContain("Evaluación de fluidez lectora");
    expect(html).toContain("floresirahetasebastian@hotmail.com");
    expect(html).not.toMatch(/enteramente en caracteres|rendered entirely in characters/);
    // Todos los assets propios cuelgan del subdirectorio.
    const assets = [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((m) => m[1]);
    expect(assets.length).toBeGreaterThan(0);
    for (const a of assets) expect(a, a).toMatch(/^\/seb-sys\//);
  });

  test("los assets referenciados responden 200", async ({ request, baseURL, page }) => {
    await gotoHome(page);
    const res = await request.get(`${baseURL}/`);
    const html = await res.text();
    const assets = [...new Set([...html.matchAll(/(?:src|href)="(\/seb-sys\/[^"]+)"/g)].map((m) => m[1]))]
      .filter((a) => !a.startsWith("/seb-sys/#"));
    for (const a of assets.slice(0, 25)) {
      const r = await request.get(`${baseURL!.replace(/\/seb-sys$/, "")}${a}`);
      expect(r.status(), a).toBe(200);
    }
  });

  test("CTA y enlaces de navegación llegan a secciones reales", async ({ page }) => {
    await gotoHome(page);
    for (const id of ["main", "work", "about", "stack", "experience", "lab", "contact"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
    await page.getByRole("link", { name: /ver proyectos|view projects/i }).click();
    await expect(page).toHaveURL(/#work$/);
    await expect(page.locator("#work")).toBeInViewport();
    await page.getByRole("link", { name: /contactarme|get in touch/i }).click();
    await expect(page.locator("#contact")).toBeInViewport();
  });

  test("una URL con ancla funciona al recargar", async ({ page }) => {
    await gotoHome(page, "#experience");
    await expect(page.locator("#experience")).toBeInViewport();
  });

  test("404 con retorno bajo /seb-sys", async ({ page, baseURL }) => {
    const res = await page.goto(`${baseURL}/no-existe`);
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/no existe|does not exist/i);
    const back = page.getByRole("link", { name: /volver|back/i });
    await expect(back).toHaveAttribute("href", "/seb-sys");
  });

  test("la escena llega a un estado explícito y el fallback existe en la misma caja", async ({ page }) => {
    await gotoHome(page);
    const box = await waitScene(page);
    await expect(box.locator('svg[role="img"]')).toHaveCount(1);
    const height = await box.evaluate((el) => el.getBoundingClientRect().height);
    expect(height).toBeGreaterThan(300);
  });
});
