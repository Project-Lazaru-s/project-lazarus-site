import { expect, test } from "@playwright/test";

test("Progressão: dragging to day 45 shows the world of that day", async ({ page }) => {
  await page.goto("/progressao");
  const slider = page.getByRole("slider", { name: "Dia" });
  await slider.fill("45");
  await expect(page.getByRole("heading", { name: "Dia 45" })).toBeVisible();
  await expect(page.getByText("Teto de hostis por perto").locator("xpath=following-sibling::dd")).toHaveText("90");
  await page.getByRole("group", { name: "Dias importantes" }).getByRole("button", { name: "14" }).click();
  await expect(page.getByRole("list", { name: "Ameaças ativas" }).locator("li", { hasText: "Runners em dobro." })).toContainText("Novo");
});

test("Baixar: the PC check gives a verdict in a real browser", async ({ page }) => {
  await page.goto("/baixar");
  await page.getByRole("button", { name: "Testar meu PC" }).click();
  await expect(
    page.getByRole("heading", { name: /Aguenta|No limite|Vai sofrer|Não deu para medir|celular/ }),
  ).toBeVisible();
  await expect(page.getByRole("list", { name: "O que o navegador revelou" }).getByRole("listitem")).toHaveCount(3);
});
