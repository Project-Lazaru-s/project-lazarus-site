import { expect, test } from "@playwright/test";

const hud = (page: import("@playwright/test").Page) => page.getByRole("status", { name: "Status do sobrevivente" });

test("scrolling to the end takes the survivor to day 60", async ({ page }) => {
  await page.goto("/");
  await expect(hud(page)).toContainText("Dia 0");
  await page.getByRole("link", { name: /sobreviver de verdade/ }).scrollIntoViewIfNeeded();
  await expect(hud(page)).toContainText("Dia 60");
  await expect(hud(page)).toContainText("Saque 25%");
});

test("Silêncio: crossing crouched reaches the other side", async ({ page }) => {
  await page.goto("/");
  const scene = page.getByRole("application", { name: "Rua com infectados" });
  await scene.scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Começar" }).first().click();
  await scene.focus();
  await page.keyboard.down("1");
  await expect(page.getByRole("heading", { name: "Atravessou" })).toBeVisible({ timeout: 15_000 });
  await page.keyboard.up("1");
});

test("Silêncio: running gets you spotted and the HUD counts the death", async ({ page }) => {
  await page.goto("/");
  const scene = page.getByRole("application", { name: "Rua com infectados" });
  await scene.scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Começar" }).first().click();
  await scene.focus();
  await page.keyboard.down("3");
  await expect(page.getByRole("heading", { name: "Avistado" })).toBeVisible({ timeout: 10_000 });
  await expect(hud(page)).toContainText("Mortes 1");
});

test("Contenção: headshots hold the first horde", async ({ page }) => {
  await page.goto("/");
  const scene = page.getByRole("application", { name: "Contenção de horda" });
  await scene.scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Começar" }).last().click();

  const held = page.getByRole("heading", { name: "Horda contida" });
  for (let i = 0; i < 40 && !(await held.isVisible()); i++) {
    const target = scene.getByRole("button").first();
    if (await target.count()) await target.press("Enter");
    await page.waitForTimeout(150);
  }
  await expect(held).toBeVisible();
  await expect(hud(page)).toContainText("Abates");
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test("the landing has no horizontal scroll and the stealth controls work by touch", async ({ page }) => {
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);

    await page.getByRole("application", { name: "Rua com infectados" }).scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Começar" }).first().tap();
    const run = page.getByRole("button", { name: /Correr/ });
    await run.dispatchEvent("pointerdown");
    await expect(page.getByRole("heading", { name: "Avistado" })).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the radio shows the whole message at once", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Saiba mais sobre os eventos" })).toBeVisible({ timeout: 1_000 });
  });
});
