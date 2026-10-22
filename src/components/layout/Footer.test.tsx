import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { links } from "@/content/site";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("links to the GitHub organization and the issue tracker", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute("href", links.organization);
    expect(screen.getByRole("link", { name: /reportar bug/i })).toHaveAttribute("href", links.issues);
  });

  it("credits both authors and states the license", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "KaiD3v" })).toHaveAttribute("href", "https://kaidev.com.br");
    expect(screen.getByRole("link", { name: "FSantiago75" })).toHaveAttribute("href", "https://github.com/FSantiago75");
    expect(screen.getByText(/todos os direitos reservados/i)).toBeInTheDocument();
  });
});
