import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { links, navItems } from "@/content/site";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("links to the GitHub organization and the issue tracker", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute("href", links.organization);
    expect(screen.getByRole("link", { name: /reportar bug/i })).toHaveAttribute("href", links.issues);
  });

  it("links to the modpack on CurseForge", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "CurseForge" })).toHaveAttribute("href", links.curseforge);
  });

  it("credits both authors and states the license", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "KaiD3v" })).toHaveAttribute("href", "https://kaidev.com.br");
    expect(screen.getByRole("link", { name: "FSantiago75" })).toHaveAttribute("href", "https://github.com/FSantiago75");
    expect(screen.getByText(/todos os direitos reservados/i)).toBeInTheDocument();
  });

  it("maps every page of the site, so nothing taken off the top bar is lost", () => {
    render(<Footer />);
    const map = screen.getByRole("navigation", { name: "Mapa do site" });
    for (const item of navItems.filter((i) => i.href !== "/")) {
      expect(
        within(map)
          .getAllByRole("link")
          .map((a) => a.getAttribute("href")),
      ).toContain(item.href);
    }
  });
});
