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
    "/lore/antes-das-bandeiras",
    "/lore/antes-das-bandeiras/leitura",
    "/lore/os-hostis",
    "/lore/os-hostis/leitura",
    "/servidor",
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

test("Lore (Arquivo 02): the folders on the desk and Haven from the well to the trading table", async ({ page }) => {
  await page.goto("/lore");
  await page.getByRole("link", { name: "Antes das Bandeiras" }).click();
  await expect(page).toHaveURL("/lore/antes-das-bandeiras");
  await page.getByRole("button", { name: "Abrir o arquivo" }).click();
  await expect(page.getByRole("button", { name: "Abrir a pasta Military" })).toBeEnabled();
  await page.getByRole("button", { name: "Abrir a pasta Haven" }).click();
  await expect(page.getByRole("heading", { name: "O poço" })).toBeVisible();

  const reach = async (gate: RegExp) => {
    const group = page.getByRole("group", { name: gate });
    for (let i = 0; i < 60 && !(await group.isVisible()); i++) await page.keyboard.press("Enter");
    await expect(group).toBeVisible();
    return group;
  };

  const well = await reach(/caderno do poço/i);
  for (const [who, n] of [
    ["Idosos", 3],
    ["Feridos", 3],
    ["Crianças", 2],
    ["Quem busca água", 2],
  ] as const)
    for (let i = 0; i < n; i++) await well.getByRole("button", { name: `Dar um balde para ${who}` }).click();
  await well.getByRole("button", { name: /assinar a regra/i }).click();
  await expect(page.getByText("Página do dossiê recuperada")).toBeVisible();

  const ward = await reach(/triagem da enfermaria/i);
  for (const to of [/cama da enfermaria/i, /observação/i, /observação/i, /cama da enfermaria/i]) {
    await ward.getByRole("button", { name: "Examinar" }).click();
    await ward.getByRole("button", { name: to }).click();
  }
  await ward.getByRole("button", { name: /^continuar/i }).click();

  const trade = await reach(/banca de trocas/i);
  await trade.getByRole("button", { name: "Um filtro" }).click();
  await trade.getByRole("button", { name: /discutir a entrada/i }).click();
  await trade.getByRole("button", { name: /abrir a banca/i }).click();

  const trace = await reach(/o caderno do poço/i);
  await expect(trace).toContainText("Item recuperado");
  await page.getByRole("button", { name: /devolver a pasta/i }).click();
  await expect(page.getByRole("button", { name: "Abrir a pasta Haven" })).toContainText("Lido");
});

test("Lore (Arquivo 02): Rovers, from the stranded bus to a guaranteed way back", async ({ page }) => {
  await page.goto("/lore/antes-das-bandeiras");
  await page.getByRole("button", { name: "Abrir o arquivo" }).click();
  await page.getByRole("button", { name: "Abrir a pasta Rovers" }).click();
  await expect(page.getByRole("heading", { name: "O ônibus" })).toBeVisible();

  const reach = async (gate: RegExp) => {
    const group = page.getByRole("group", { name: gate });
    for (let i = 0; i < 60 && !(await group.isVisible()); i++) await page.keyboard.press("Enter");
    await expect(group).toBeVisible();
    return group;
  };

  const bus = await reach(/tirar o ônibus/i);
  for (const [car, parts] of [
    ["Revistar o sedã", ["Pegar bateria"]],
    ["Revistar a van", ["Pegar correia"]],
    ["Revistar o táxi", ["Pegar pneu", "Pegar combustível"]],
  ] as const) {
    await bus.getByRole("button", { name: car }).click();
    for (const part of parts) await bus.getByRole("button", { name: part }).click();
  }
  await bus.getByRole("button", { name: /arrancar os bancos/i }).click();
  await bus.getByRole("button", { name: /dar a partida/i }).click();

  const crew = await reach(/tripulação do ônibus/i);
  for (const who of ["Josué", "Célia", "Tânia", "Bento"])
    await crew.getByRole("button", { name: new RegExp(who) }).click();
  await crew.getByRole("button", { name: /fechar a tripulação/i }).click();

  const route = await reach(/volta garantida/i);
  await route.getByRole("application", { name: "Mapa da ida" }).focus();
  for (let i = 0; i < 21; i++) await page.keyboard.press("ArrowRight");
  await route.getByRole("application", { name: "Mapa da volta" }).focus();
  for (const [key, n] of [
    ["ArrowDown", 4],
    ["ArrowLeft", 21],
    ["ArrowUp", 4],
  ] as const)
    for (let i = 0; i < n; i++) await page.keyboard.press(key);
  await route.getByRole("button", { name: /registrar a rota/i }).click();

  await reach(/o mapa das rotas riscadas/i);
  await page.getByRole("button", { name: /devolver a pasta/i }).click();
  await expect(page.getByRole("button", { name: "Abrir a pasta Rovers" })).toContainText("Lido");
});

test("Lore (Arquivo 02): Wardens, from the first night watch to the retreat", async ({ page }) => {
  await page.goto("/lore/antes-das-bandeiras");
  await page.getByRole("button", { name: "Abrir o arquivo" }).click();
  await page.getByRole("button", { name: "Abrir a pasta Wardens" }).click();
  await expect(page.getByRole("heading", { name: "O portão aberto" })).toBeVisible();

  const reach = async (gate: RegExp) => {
    const group = page.getByRole("group", { name: gate });
    for (let i = 0; i < 60 && !(await group.isVisible()); i++) await page.keyboard.press("Enter");
    await expect(group).toBeVisible();
    return group;
  };

  const watch = await reach(/escala de vigia/i);
  for (const [slot, who] of [
    ["Anoitecer", "Nogueira"],
    ["Meia-noite", "Ivete"],
    ["Madrugada", "Caio"],
    ["Amanhecer", "Nogueira"],
  ])
    await watch
      .getByRole("radiogroup", { name: `Turno: ${slot}` })
      .getByRole("radio", { name: who })
      .click();
  await watch.getByRole("button", { name: /assinar a escala/i }).click();

  const gate = await reach(/livro de entradas/i);
  for (const answer of ["Abrir o portão", "Área de espera", "Área de espera"]) {
    await gate.getByRole("button", { name: "Revistar" }).click();
    await gate.getByRole("button", { name: answer }).click();
  }
  await gate.getByRole("button", { name: /passar o turno/i }).click();

  const retreat = await reach(/a retirada/i);
  for (let i = 0; i < 4; i++) await retreat.getByRole("button", { name: "Segurar o portão" }).click();
  await retreat.getByRole("button", { name: "Fechar o portão" }).click();
  await retreat.getByRole("button", { name: /^continuar/i }).click();

  await reach(/o primeiro livro de entradas/i);
  await page.getByRole("button", { name: /devolver a pasta/i }).click();
  await expect(page.getByRole("button", { name: "Abrir a pasta Wardens" })).toContainText("Lido");
});

test("Lore (Arquivo 02): Military, from the quarantine marks to the epilogue", async ({ page }) => {
  await page.goto("/lore/antes-das-bandeiras");
  // As outras três pastas já lidas: Military é a última e abre o epílogo.
  await page.evaluate(() =>
    localStorage.setItem(
      "lazarus:lore:antes-das-bandeiras",
      JSON.stringify({ v: 1, open: null, at: {}, done: ["haven", "rovers", "wardens"] }),
    ),
  );
  await page.reload();
  await page.getByRole("button", { name: "Abrir o arquivo" }).click();
  await page.getByRole("button", { name: "Abrir a pasta Military" }).click();
  await expect(page.getByRole("heading", { name: "O posto" })).toBeVisible();

  const reach = async (gate: RegExp) => {
    const group = page.getByRole("group", { name: gate });
    for (let i = 0; i < 60 && !(await group.isVisible()); i++) await page.keyboard.press("Enter");
    await expect(group).toBeVisible();
    return group;
  };

  const block = await reach(/quarentena da quadra/i);
  for (const b of ["Padaria", "Farmácia", "Prédio azul"])
    await block.getByRole("button", { name: `Marcar ${b}` }).click();
  await block.getByRole("button", { name: /entregar o relatório/i }).click();
  await block.getByRole("button", { name: /^continuar/i }).click();

  const radio = await reach(/duas ordens no rádio/i);
  await radio.getByRole("button", { name: /ouvir o rádio/i }).click();
  await radio.getByRole("button", { name: /próxima transmissão/i }).click();
  await radio.getByRole("button", { name: /retirar os civis/i }).click();
  await radio.getByRole("button", { name: /confirmar pela frequência/i }).click();
  await radio.getByRole("button", { name: /^continuar/i }).click();

  const book = await reach(/livro de estoque/i);
  for (let i = 0; i < 6; i++) await book.getByRole("button", { name: "Menos filtros" }).click();
  for (let i = 0; i < 2; i++) await book.getByRole("button", { name: "Menos doses de soro" }).click();
  await book.getByRole("button", { name: /fechar a conta/i }).click();
  await book.getByRole("button", { name: /assinar o livro/i }).click();

  await reach(/duas ordens no quadro de avisos/i);
  await page.getByRole("button", { name: /devolver a pasta/i }).click();
  await expect(page.getByRole("heading", { name: /arquivo completo/i })).toBeVisible();
  await page.getByRole("link", { name: /arquivo 01/i }).click();
  await expect(page).toHaveURL("/lore/o-inicio-do-caos");
});

test("Lore (Arquivo 03): the alert board and the Deserters, from the silent radio to the toll", async ({ page }) => {
  await page.goto("/lore");
  await page.getByRole("link", { name: "Os Hostis" }).click();
  await expect(page).toHaveURL("/lore/os-hostis");
  await page.getByRole("button", { name: "Olhar o quadro" }).click();
  await expect(page.getByRole("heading", { name: "Quadro de alertas" })).toBeVisible();
  await page.getByRole("button", { name: "Investigar: Desertores" }).click();
  await expect(page.getByRole("heading", { name: "A ordem que não chegou" })).toBeVisible();

  const reach = async (gate: RegExp) => {
    const group = page.getByRole("group", { name: gate });
    for (let i = 0; i < 60 && !(await group.isVisible()); i++) await page.keyboard.press("Enter");
    await expect(group).toBeVisible();
    return group;
  };

  const radio = await reach(/três dias de rádio/i);
  for (let day = 1; day <= 3; day++)
    await radio.getByRole("button", { name: `Chamar a substituição (dia ${day})` }).click();
  await radio.getByRole("button", { name: /abrir a caixa de remédios/i }).click();
  await radio.getByRole("button", { name: /^continuar/i }).click();

  const dawn = await reach(/a madrugada no posto/i);
  for (const who of [/comandante/i, /cabo lima/i, /sargento vaz/i])
    await dawn.getByRole("button", { name: who }).click();
  await dawn.getByRole("button", { name: /registrar a saída/i }).click();
  await dawn.getByRole("button", { name: /^continuar/i }).click();

  const road = await reach(/patrulha ou desertores/i);
  for (const answer of ["Patrulha Military", "Desertores", "Desertores", "Patrulha Military"])
    await road.getByRole("button", { name: answer, exact: true }).click();
  await road.getByRole("button", { name: /^continuar/i }).click();

  await reach(/o livro de serviço/i);
  await page.getByRole("button", { name: /prender no quadro/i }).click();
  await expect(page.getByRole("button", { name: "Investigar: Desertores" })).toContainText("Investigado");
});
