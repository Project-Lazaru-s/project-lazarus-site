import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { navItems } from "@/content/site";
import { Header } from "./Header";

vi.mock("next/navigation", () => ({ usePathname: () => "/faccoes" }));

describe("Header", () => {
  it("links the logo to the home page", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: /project lazarus/i })).toHaveAttribute("href", "/");
  });

  it("renders one link per nav item", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: /principal/i });
    for (const item of navItems) {
      expect(within(nav).getByRole("link", { name: item.label })).toHaveAttribute("href", item.href);
    }
  });

  it("marks the current section", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: /principal/i });
    expect(within(nav).getByRole("link", { name: "Facções" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "Início" })).not.toHaveAttribute("aria-current");
  });

  it("has a download call to action for the current version", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: /baixar 1\.0\.0/i })).toHaveAttribute("href", "/baixar");
  });
});
