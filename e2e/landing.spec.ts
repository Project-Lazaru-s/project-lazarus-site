import { expect, test } from "@playwright/test";

import type { Page } from "@playwright/test";

const hud = (page: Page) => page.getByRole("status", { name: "Status do sobrevivente" });

/** Rola até o encontro e clica no "Começar" dele (o botão fica na moldura, irmão da cena). */
async function start(page: Page, sceneName: string) {
  const scene = page.getByRole("application", { name: sceneName });
  await scene.scrollIntoViewIfNeeded();
  await scene.locator("xpath=..").getByRole("button", { name: "Começar" }).click();
  return scene;
}

test("scrolling to the end takes the survivor to day 60", async ({ page }) => {
  await page.goto("/");
  await expect(hud(page)).toContainText("Dia 0");
  await page.getByRole("link", { name: /sobreviver de verdade/ }).scrollIntoViewIfNeeded();
  await expect(hud(page)).toContainText("Dia 60");
  await expect(hud(page)).toContainText("Saque 25%");
});

test("Silêncio: crossing crouched reaches the other side", async ({ page }) => {
  await page.goto("/");
  const scene = await start(page, "Rua com infectados");
  await scene.focus();
  await page.keyboard.down("1");
  await expect(page.getByRole("heading", { name: "Atravessou" })).toBeVisible({ timeout: 15_000 });
  await page.keyboard.up("1");
});

test("Silêncio: running gets you spotted and the HUD counts the death", async ({ page }) => {
  await page.goto("/");
  const scene = await start(page, "Rua com infectados");
  await scene.focus();
  await page.keyboard.down("3");
  await expect(page.getByRole("heading", { name: "Avistado" })).toBeVisible({ timeout: 10_000 });
  await expect(hud(page)).toContainText("Mortes 1");
});

test("Contenção: headshots hold the first horde", async ({ page }) => {
  await page.goto("/");
  const scene = await start(page, "Contenção de horda");

  const held = page.getByRole("heading", { name: "Horda contida" });
  for (let i = 0; i < 40 && !(await held.isVisible()); i++) {
    const target = scene.getByRole("button").first();
    if (await target.count()) await target.press("Enter");
    await page.waitForTimeout(150);
  }
  await expect(held).toBeVisible();
  await expect(hud(page)).toContainText("Abates");
});

test("Sede: sealed water is safe", async ({ page }) => {
  await page.goto("/");
  const scene = await start(page, "Fontes de água");
  await scene.getByRole("button", { name: /lacrada|enlatada/ }).click();
  await expect(page.getByRole("heading", { name: "Água limpa" })).toBeVisible();
});

test("Por trás: striking when the marker crosses the window finishes them", async ({ page }) => {
  await page.goto("/");
  const scene = await start(page, "Beco com infectados de costas");
  const marker = scene.locator("xpath=following-sibling::div[1]//div[contains(@class,'bg-plate')]");
  for (let round = 0; round < 3; round++) {
    await page.waitForFunction(
      (el) => Math.abs(parseFloat((el as HTMLElement).style.left) - 50) < 4,
      await marker.elementHandle(),
      { polling: "raf", timeout: 5_000 },
    );
    await page.getByRole("button", { name: "Golpear" }).click();
  }
  await expect(page.getByRole("heading", { name: /de 3/ })).toBeVisible();
  await expect(hud(page)).toContainText("Abates");
});

test("Farmácia: three cabinets, then the dossier shows the loot", async ({ page }) => {
  await page.goto("/");
  const scene = await start(page, "Farmácia saqueada");
  for (let i = 1; i <= 3; i++) await scene.getByRole("button", { name: `Abrir armário ${i}` }).click();
  await expect(page.getByRole("heading", { name: /Algo sobrou|Nada/ })).toBeVisible();
  const loot = page.getByText("Saque", { exact: true }).locator("xpath=following-sibling::dd");
  await expect(loot).toHaveText(/de 3/);
});

test("the dossier can be shared", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.evaluate(() => Object.defineProperty(navigator, "share", { value: undefined }));
  const share = page.getByRole("button", { name: "Compartilhar" });
  await share.scrollIntoViewIfNeeded();
  await share.click();
  await expect(page.getByText("Copiado. Desafie alguém.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("Project Lazarus");
});

test("Rovers: intimidating twice makes you wanted and the hunters come", async ({ page }) => {
  await page.goto("/");
  const scene = await start(page, "Acampamento dos Rovers");
  await scene.getByRole("button", { name: "Intimidar" }).click();
  await scene.getByRole("button", { name: "Intimidar" }).click();
  await expect(scene.getByRole("heading", { name: "Procurado" })).toBeVisible();
  await expect(hud(page)).toContainText(/procurado/i);
  await scene.getByRole("button", { name: "Lutar" }).click();
  await expect(page.getByRole("heading", { name: /Esquadrão abatido|Pego/ })).toBeVisible();
});

test("Fale baixo: without a microphone, the buttons still let you shout", async ({ page }) => {
  await page.goto("/");
  const scene = await start(page, "Sua voz e os infectados");
  await expect(scene.getByText(/Sem microfone/)).toBeVisible();
  await scene.getByRole("button", { name: "Gritar" }).dispatchEvent("pointerdown");
  await expect(scene.getByText("Grito")).toBeVisible();
  await expect(scene.getByText("!")).toHaveCount(3);
  await scene.getByRole("button", { name: "Encerrar" }).click();
  await expect(page.getByRole("heading", { name: "3 ouviram" })).toBeVisible();
});

test("the dossier links to a shareable card with a preview image", async ({ page, request }) => {
  await page.goto("/");
  const card = page.getByRole("link", { name: "Ver cartão" });
  await card.scrollIntoViewIfNeeded();
  await card.click();
  await expect(page).toHaveURL(/\/dossie\/[a-z0-9-]+$/);
  await expect(page.getByRole("heading", { name: "Carne fresca" })).toBeVisible();
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  const image = await request.get(new URL(og!).pathname + new URL(og!).search);
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toBe("image/png");
});

test("a forged dossier code is a 404", async ({ page }) => {
  const response = await page.goto("/dossie/3c-n-1-4a-2-2-6-2-28-7");
  expect(response?.status()).toBe(404);
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
