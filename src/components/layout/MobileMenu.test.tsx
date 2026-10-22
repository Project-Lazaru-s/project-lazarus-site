import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { navItems } from "@/content/site";
import { MobileMenu } from "./MobileMenu";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

// jsdom não implementa o modal do <dialog>; basta o atributo open.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.open = false;
  };
});

const dialog = () => screen.getByRole("dialog", { hidden: true });

describe("MobileMenu", () => {
  it("opens a full menu with every section", () => {
    render(<MobileMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    expect(dialog()).toHaveAttribute("open");
    const nav = within(dialog()).getByRole("navigation", { name: "Navegação móvel" });
    expect(within(nav).getAllByRole("link")).toHaveLength(navItems.length);
  });

  it("closes after picking a section", () => {
    render(<MobileMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(within(dialog()).getByRole("link", { name: "Facções" }));
    expect(dialog()).not.toHaveAttribute("open");
  });

  it("closes with the close button or a tap outside the panel", () => {
    render(<MobileMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(within(dialog()).getByRole("button", { name: "Fechar menu" }));
    expect(dialog()).not.toHaveAttribute("open");

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(dialog());
    expect(dialog()).not.toHaveAttribute("open");
  });
});
