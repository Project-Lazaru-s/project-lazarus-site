import { expect, test } from "@playwright/test";

test("Progressão: dragging to day 45 shows the world of that day", async ({ page }) => {
  await page.goto("/progressao");
  const slider = page.getByRole("slider", { name: "Dia" });
  // No dev server o input pode receber o valor antes da hidratação; repete (zerando antes) até o React reagir.
  await expect(async () => {
    await slider.fill("0");
    await slider.fill("45");
    await expect(page.getByRole("heading", { name: "Dia 45" })).toBeVisible({ timeout: 1000 });
  }).toPass();
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

test("the boot screen shows on the first page of the session only", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Gerando mundo…")).toBeVisible();
  await expect(page.getByText("Gerando mundo…")).toBeHidden({ timeout: 4_000 });
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Facções" }).click();
  await expect(page).toHaveURL("/faccoes");
  await expect(page.getByText("Gerando mundo…")).toBeHidden();
});

test("Facções: a card flips to its details and the bounty threshold", async ({ page }) => {
  await page.goto("/faccoes");
  await page.getByRole("button", { name: "Ver detalhes de Rovers" }).click();
  const back = page.locator("#rovers [data-face=back]");
  await expect(back).toContainText("Rivais dos Wardens.");
  await expect(back.getByRole("img", { name: /procurado em -40/ })).toBeVisible();
  await back.getByRole("button", { name: "Voltar" }).click();
  await expect(page.locator("#rovers [data-face=front]")).not.toHaveAttribute("inert", "");
});

test("404: the chase can be won by mashing the space bar", async ({ page }) => {
  await page.goto("/nao-existe");
  await page.getByRole("button", { name: "Fugir" }).click();
  for (let i = 0; i < 30 && !(await page.getByRole("heading", { name: "Você escapou." }).isVisible()); i++) {
    await page.keyboard.press("Space");
    await page.waitForTimeout(60);
  }
  await expect(page.getByRole("heading", { name: "Você escapou." })).toBeVisible();
});

test("Baixar: the install checklist is remembered after a reload", async ({ page }) => {
  await page.goto("/baixar");
  await page.getByRole("checkbox").first().check();
  await expect(page.getByText("1 de 3")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("checkbox").first()).toBeChecked();
});

test("Mods: 'Jogue no site' lands on the minigame of that mod", async ({ page }) => {
  await page.goto("/mods/stealth");
  await page.getByRole("link", { name: "Jogue no site" }).click();
  await expect(page).toHaveURL(/\/#silencio$/);
  await expect(page.locator("#silencio")).toBeInViewport();
});
