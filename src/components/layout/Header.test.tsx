import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { modpackMenu, topNav } from "@/content/site";
import { Header } from "./Header";

let pathname = "/faccoes";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

const mainNav = () => screen.getByRole("navigation", { name: "Navegação principal" });
const modpackButton = () => within(mainNav()).getByRole("button", { name: /o modpack/i });

describe("Header", () => {
  beforeEach(() => {
    pathname = "/faccoes";
  });

  it("links the logo to the home page", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: /project lazarus/i })).toHaveAttribute("href", "/");
  });

  it("keeps only the modpack menu and three links in the top bar", () => {
    render(<Header />);
    for (const item of topNav) {
      expect(within(mainNav()).getByRole("link", { name: item.label })).toHaveAttribute("href", item.href);
    }
    expect(within(mainNav()).queryByRole("link", { name: "Início" })).not.toBeInTheDocument();
    expect(within(mainNav()).queryByRole("link", { name: "Blog" })).not.toBeInTheDocument();
  });

  it("opens the modpack menu with a line about each page, and closes it with Escape", () => {
    render(<Header />);
    expect(modpackButton()).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(modpackButton());
    expect(modpackButton()).toHaveAttribute("aria-expanded", "true");
    for (const item of modpackMenu) {
      const link = within(mainNav()).getByRole("link", { name: new RegExp(item.label) });
      expect(link).toHaveAttribute("href", item.href);
      expect(link).toHaveTextContent(item.description!);
    }
    fireEvent.keyDown(modpackButton(), { key: "Escape" });
    expect(modpackButton()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the menu on a click outside it", () => {
    render(<Header />);
    fireEvent.click(modpackButton());
    fireEvent.pointerDown(document.body);
    expect(modpackButton()).toHaveAttribute("aria-expanded", "false");
  });

  it("marks the current section, including pages inside the modpack menu", () => {
    const { unmount } = render(<Header />);
    expect(within(mainNav()).getByRole("link", { name: "Facções" })).toHaveAttribute("aria-current", "page");
    expect(modpackButton()).not.toHaveAttribute("data-active");
    unmount();

    pathname = "/progressao";
    render(<Header />);
    expect(modpackButton()).toHaveAttribute("data-active", "true");
  });

  it("has a download call to action for the current version", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: /baixar 1\.0\.0/i })).toHaveAttribute("href", "/baixar");
  });
});
