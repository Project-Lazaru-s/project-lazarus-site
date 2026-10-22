import { expect, test } from "@playwright/test";

// Chromium com um microfone falso (tom periódico), já com permissão concedida.
test.use({
  permissions: ["microphone"],
  launchOptions: { args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] },
});

test("Fale baixo: the microphone volume is measured", async ({ page }) => {
  await page.goto("/");
  const scene = page.getByRole("application", { name: "Sua voz e os infectados" });
  await scene.scrollIntoViewIfNeeded();
  await scene.locator("xpath=..").getByRole("button", { name: "Começar" }).click();
  await expect(scene.getByText("Sensibilidade")).toBeVisible();
  await expect(scene.getByText(/Sussurro|Fala|Grito/)).toBeVisible({ timeout: 5_000 });
});
