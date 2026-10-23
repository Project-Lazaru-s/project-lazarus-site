import { expect, test } from "@playwright/test";

const card = Buffer.from(JSON.stringify([42, "Kai_D3v", "f1041"])).toString("base64url");

test("Servidor: tune the radio, answer a call and fill the form (closed without a database)", async ({ page }) => {
  await page.goto("/servidor");
  const radio = page.getByRole("group", { name: "Rádio de recrutamento" });
  const dial = radio.getByRole("slider", { name: "Frequência" });
  // Antes da hidratação o React ainda não reage ao dial; repete até a transmissão aparecer.
  await expect(async () => {
    await dial.fill("85");
    await dial.fill("121.5");
    await expect(radio.getByText(/falando do bairro/)).toBeVisible({ timeout: 1000 });
  }).toPass();
  await radio.getByRole("button", { name: "Responder ao chamado da 121.5" }).click();

  const form = page.getByRole("form", { name: "Ficha de alistamento" });
  await expect(form.getByText("121.5 · Milícia civil")).toBeVisible();
  const next = form.getByRole("button", { name: "Próximo" });
  await next.click();
  await expect(form.getByText(/3 a 16 letras/)).toBeVisible();
  await form.getByLabel(/Nick do Minecraft/).fill("Kai_D3v");
  await form.getByLabel("E-mail para a convocação").fill("recruta@example.com");
  await form.getByLabel("WhatsApp (opcional)").fill("(11) 98765-4321");
  await next.click();
  await form.getByRole("radio", { name: "Novato em PvP" }).check({ force: true });
  await form.getByRole("radio", { name: "Nordeste" }).check({ force: true });
  await form.getByRole("radio", { name: "Madrugada" }).check({ force: true });
  await next.click();
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Transmitir e alistar" }).click();
  await expect(form.getByRole("alert")).toContainText(/ainda não está aberto/);
});

test("Servidor: the shareable card has a preview image; a forged one is a 404", async ({ page, request }) => {
  await page.goto(`/servidor/ficha/${card}`);
  await expect(page.getByRole("heading", { name: "Kai_D3v respondeu ao chamado." })).toBeVisible();
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  const image = await request.get(new URL(og!).pathname + new URL(og!).search);
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toBe("image/png");
  expect((await page.goto("/servidor/ficha/forjado"))?.status()).toBe(404);
});

test("Servidor: the forms area asks for a password", async ({ request }) => {
  for (const path of ["/servidor/admin", "/servidor/admin/fichas.csv"]) {
    const response = await request.get(path, { headers: { Authorization: "Basic " + btoa("x:errada") } });
    expect(response.status()).toBe(401);
    expect(response.headers()["www-authenticate"]).toContain("Basic");
  }
});
