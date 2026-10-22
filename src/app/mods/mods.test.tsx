import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { lazarusMods } from "@/content/mods";
import ModPage, { generateStaticParams } from "./[slug]/page";
import ModsPage from "./page";

const params = (slug: string) => ({ params: Promise.resolve({ slug }) }) as PageProps<"/mods/[slug]">;

describe("/mods", () => {
  it("shows a card per Lazarus mod linking to its page", () => {
    render(<ModsPage />);
    for (const mod of lazarusMods) {
      const card = screen.getByRole("article", { name: mod.name });
      expect(within(card).getByText(`v${mod.version}`)).toBeInTheDocument();
      expect(within(card).getByRole("link", { name: new RegExp(mod.name) })).toHaveAttribute("href", `/mods/${mod.slug}`);
    }
  });
});

describe("/mods/[slug]", () => {
  it("prerenders every mod", () => {
    expect(generateStaticParams()).toEqual(lazarusMods.map(({ slug }) => ({ slug })));
  });

  it("shows banner, features and the GitHub repository", async () => {
    render(await ModPage(params("stealth")));
    expect(screen.getByRole("heading", { level: 1, name: "Lazarus Stealth" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /banner do lazarus stealth/i })).toBeInTheDocument();
    expect(screen.getByText(/finalização furtiva por trás/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /código no github/i })).toHaveAttribute(
      "href",
      "https://github.com/Project-Lazaru-s/lazarus-stealth",
    );
  });

  it("returns 404 for an unknown mod", async () => {
    await expect(ModPage(params("nao-existe"))).rejects.toThrow();
  });
});
