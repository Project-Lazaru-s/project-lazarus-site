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

  it("credits the author and states the license", () => {
    render(<Footer />);
    expect(screen.getByText(/kaique melo/i)).toBeInTheDocument();
    expect(screen.getByText(/todos os direitos reservados/i)).toBeInTheDocument();
  });
});
