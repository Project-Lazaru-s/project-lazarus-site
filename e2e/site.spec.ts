import { expect, test } from "@playwright/test";
import { links, navItems } from "../src/content/site";

test("the top bar opens the modpack menu and goes to Progressão", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Navegação principal" });
  await nav.getByRole("button", { name: /o modpack/i }).click();
  await nav.getByRole("link", { name: /progressão/i }).click();
  await expect(page).toHaveURL("/progressao");
  await expect(nav.getByRole("button", { name: /o modpack/i })).toHaveAttribute("data-active", "true");
});

test("every section is reachable from the site map and never says alpha", async ({ page }) => {
  await page.goto("/");
  const map = page.getByRole("navigation", { name: "Mapa do site" });
  for (const item of navItems.filter((i) => i.href !== "/")) {
    await map.locator(`a[href="${item.href}"]`).click();
    await expect(page).toHaveURL(item.href);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/alpha/i);
  }
});

test("the download goes to the latest GitHub release", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("region", { name: "Apresentação" }).getByRole("link", { name: "Baixar 1.0.0" }).click();
  await expect(page).toHaveURL("/baixar");
  await expect(page.getByRole("link", { name: /Baixar Project-Lazarus-1\.0\.0\.zip/ })).toHaveAttribute(
    "href",
    links.download,
  );
});

test("the changelog shows the 1.0.0 release from GitHub", async ({ page }) => {
  await page.goto("/changelog");
  await expect(page.getByRole("heading", { level: 2, name: "Project Lazarus 1.0.0" })).toBeVisible();
});

test("mod cards open the mod page", async ({ page }) => {
  await page.goto("/mods");
  await page.getByRole("link", { name: "Lazarus Stealth" }).click();
  await expect(page).toHaveURL("/mods/stealth");
  await expect(page.getByRole("img", { name: "Banner do Lazarus Stealth" })).toBeVisible();
});

for (const path of ["/mods/nao-existe", "/blog/nao-existe", "/nao-existe"]) {
  test(`${path} answers 404 in PT-BR`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
  });
}

test.describe("mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("the menu opens and navigates", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("navigation", { name: "Navegação móvel" }).getByRole("link", { name: "Facções" }).click();
    await expect(page).toHaveURL("/faccoes");
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
    await expect(page.getByRole("heading", { level: 1, name: "Facções" })).toBeVisible();
  });
});
