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
  await expect(
    page.getByRole("list", { name: "Ameaças ativas" }).locator("li", { hasText: "Runners em dobro." }),
  ).toContainText("Novo");
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

test.describe("mobile", () => {
  test.use({ viewport: { width: 360, height: 800 } });

  for (const route of [
    "/modpack",
    "/faccoes",
    "/progressao",
    "/mods",
    "/mods/events",
    "/baixar",
    "/changelog",
    "/blog",
    "/blog/1-0-0-chegou",
    "/creditos",
    "/lore",
    "/lore/o-inicio-do-caos",
    "/lore/o-inicio-do-caos/leitura",
  ]) {
    test(`${route} has no horizontal scroll`, async ({ page }) => {
      await page.goto(route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
    });
  }
});

test("Lore (reading mode): the night of the gate, the roads and the reader's Day 1", async ({ page }) => {
  await page.goto("/lore/o-inicio-do-caos/leitura");
  await page.getByRole("navigation", { name: "Atos" }).getByRole("link", { name: /^IV/ }).click();
  await page.getByRole("tab", { name: /noite da cancela/i }).click();
  await expect(page.getByRole("tabpanel")).toContainText("O tiro saiu da guarita.");

  await page.getByRole("radio", { name: /o mais longo/i }).check({ force: true });
  await expect(page.getByText(/você vai pela rota longa/i)).toBeVisible();

  const cta = page.getByRole("region", { name: /seu dia 1/i });
  await cta.getByRole("link", { name: /baixar e começar/i }).click();
  await expect(page).toHaveURL("/baixar");
});

test("Lore (game): every act waits for the player, from the archive to Day 1", async ({ page }) => {
  await page.goto("/lore");
  await expect(page.getByRole("article", { name: /lacrado/i }).first()).toBeVisible();
  await page.getByRole("link", { name: "O Início do Caos" }).click();
  await expect(page).toHaveURL("/lore/o-inicio-do-caos");
  await page.getByRole("button", { name: "Novo jogo" }).click();

  // Avança falas e cartões de ato com o teclado até o portão aparecer.
  const reach = async (gate: RegExp) => {
    const group = page.getByRole("group", { name: gate });
    for (let i = 0; i < 60 && !(await group.isVisible()); i++) await page.keyboard.press("Enter");
    await expect(group).toBeVisible();
    return group;
  };

  const sheet = await reach(/ficha de triagem/i);
  await sheet.getByRole("button", { name: "óbito", exact: true }).click();
  await expect(sheet).toContainText("Óbito não explica");
  await sheet.getByRole("button", { name: "movimento após declaração de óbito" }).click();
  const stamp = sheet.getByRole("button", { name: /carimbar/i });
  await stamp.hover();
  await page.mouse.down();
  await page.waitForTimeout(900);
  await page.mouse.up();
  await sheet.getByRole("button", { name: /^continuar/i }).click();
  await expect(page.getByText("Página recuperada")).toBeVisible();

  const radio = await reach(/rádio de emergência/i);
  await radio.getByRole("slider", { name: /frequência/i }).fill("93.7");
  await radio.getByRole("button", { name: /desligar o rádio/i }).click();

  const scene = await reach(/investigar/i);
  for (const spot of await scene.getByRole("button", { name: /examinar/i }).all()) await spot.click();
  await scene.getByRole("button", { name: /^continuar/i }).click();

  const night = await reach(/reconstruir a noite/i);
  for (const fact of [
    "A cancela não abriu.",
    "Houve tiros.",
    "Morreram um motorista Rover e um guarda Warden.",
    "Parte da carga sumiu.",
  ])
    await night.getByRole("button", { name: fact }).first().click();
  await night.getByRole("button", { name: /^continuar/i }).click();

  const walls = await reach(/paredes/i);
  for (let i = 0; i < 8; i++)
    await walls
      .getByRole("button", { name: /parede/i })
      .first()
      .click();
  await walls.getByRole("button", { name: /^continuar/i }).click();

  const roads = await reach(/três caminhos/i);
  // Traça a rota dos Rovers com o teclado: 6 para cima, 21 para a direita, 6 para baixo.
  await roads.getByRole("application", { name: /mapa até a cidade/i }).focus();
  for (const [key, times] of [
    ["ArrowUp", 6],
    ["ArrowRight", 21],
    ["ArrowDown", 6],
  ] as const)
    for (let i = 0; i < times; i++) await page.keyboard.press(key);
  await expect(roads).toContainText("rota longa");
  await roads.getByRole("button", { name: /seguir por aqui/i }).click();

  const end = await reach(/seu dia 1/i);
  await expect(end).toContainText("5/5");
  await page.reload();
  await expect(page.getByRole("button", { name: /continuar de onde parou/i })).toBeVisible();
  await page.getByRole("button", { name: /continuar de onde parou/i }).click();
  await page
    .getByRole("group", { name: /seu dia 1/i })
    .getByRole("link", { name: /baixar e começar/i })
    .click();
  await expect(page).toHaveURL("/baixar");
});
