import { expect, test } from "@playwright/test";

const card = Buffer.from(JSON.stringify([42, "Kai_D3v", "rovers"])).toString("base64url");

test("Servidor: the 4-step form validates, then sends (closed without a database)", async ({ page }) => {
  await page.goto("/servidor");
  const form = page.getByRole("form", { name: "Ficha de alistamento" });
  const next = form.getByRole("button", { name: "Próximo" });
  // Antes da hidratação o clique recarrega a página; repete até o React mostrar o erro.
  await expect(async () => {
    await next.click();
    await expect(form.getByText(/3 a 16 letras/)).toBeVisible({ timeout: 1000 });
  }).toPass();

  await form.getByLabel("Nick do Minecraft").fill("Kai_D3v");
  await form.getByLabel("E-mail").fill("recruta@example.com");
  await form.getByLabel("WhatsApp (opcional)").fill("(11) 98765-4321");
  await next.click();
  await form.getByRole("radio", { name: /fundar a minha/i }).check({ force: true });
  await next.click();
  await form.getByRole("radio", { name: "Novato em PvP" }).check({ force: true });
  await form.getByRole("radio", { name: "Nordeste" }).check({ force: true });
  await form.getByRole("radio", { name: "Madrugada" }).check({ force: true });
  await next.click();
  await expect(form.getByText(/De 2 a 50/)).toBeVisible();
  await form.getByLabel("Quantas pessoas no seu grupo").fill("6");
  await next.click();
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Assinar e alistar" }).click();
  await expect(form.getByRole("alert")).toContainText(/ainda não está aberto|ALISTADO/);
});

test("Servidor: the shareable card has a preview image; a forged one is a 404", async ({ page, request }) => {
  await page.goto(`/servidor/ficha/${card}`);
  await expect(page.getByRole("heading", { name: "Kai_D3v escolheu um lado." })).toBeVisible();
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  const image = await request.get(new URL(og!).pathname + new URL(og!).search);
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toBe("image/png");
  expect((await page.goto("/servidor/ficha/forjado"))?.status()).toBe(404);
});
