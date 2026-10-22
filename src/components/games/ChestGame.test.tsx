import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConnectedHud, SurvivalProvider } from "@/components/survival/SurvivalProvider";
import { highlights } from "@/content/home";
import { LOCKPICKS } from "@/lib/games/lockpick";
import { ChestGame } from "./ChestGame";

afterEach(() => vi.restoreAllMocks());

function renderChest() {
  // Com Math.random = 0, o embaralhamento deixa a ordem secreta em [1, 2, 3, 0].
  vi.spyOn(Math, "random").mockReturnValue(0);
  render(
    <SurvivalProvider>
      <ChestGame />
      <ConnectedHud />
    </SurvivalProvider>,
  );
}

const lock = () => screen.getByRole("group", { name: /cadeado/i });
const pin = (n: number) => within(lock()).getByRole("button", { name: `Pino ${n}` });
const loot = () => screen.queryByRole("list", { name: /conteúdo do baú/i });

describe("ChestGame", () => {
  it("starts locked, hiding what is inside", () => {
    renderChest();
    expect(screen.getByRole("img", { name: /baú trancado/i })).toBeInTheDocument();
    expect(loot()).not.toBeInTheDocument();
  });

  it("setting every pin in the right order opens the chest and shows its content", () => {
    renderChest();
    fireEvent.click(screen.getByRole("button", { name: /usar gazua/i }));
    for (const n of [2, 3, 4, 1]) fireEvent.click(pin(n));
    expect(screen.getByRole("img", { name: /baú aberto/i })).toBeInTheDocument();
    for (const highlight of highlights) {
      expect(within(loot()!).getByRole("link", { name: new RegExp(highlight.title) })).toHaveAttribute(
        "href",
        highlight.href,
      );
    }
  });

  it("a set pin stays up", () => {
    renderChest();
    fireEvent.click(screen.getByRole("button", { name: /usar gazua/i }));
    fireEvent.click(pin(2));
    expect(pin(2)).toHaveAttribute("aria-pressed", "true");
  });

  it("a wrong pin breaks a lockpick and drops the pins", () => {
    renderChest();
    fireEvent.click(screen.getByRole("button", { name: /usar gazua/i }));
    fireEvent.click(pin(2));
    fireEvent.click(pin(1));
    expect(within(lock()).getByText(`Gazuas: ${LOCKPICKS - 1}`)).toBeInTheDocument();
    expect(pin(2)).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(/a gazua quebrou/i)).toBeInTheDocument();
  });

  it("forcing it open works, but the noise scares you", () => {
    renderChest();
    fireEvent.click(screen.getByRole("button", { name: /arrombar/i }));
    expect(loot()).toBeInTheDocument();
    expect(screen.getByRole("status", { name: /sobrevivente/i })).toHaveTextContent("Tense");
  });

  it("with no lockpicks left the lock jams, and forcing is the way", () => {
    renderChest();
    fireEvent.click(screen.getByRole("button", { name: /usar gazua/i }));
    for (let i = 0; i < LOCKPICKS; i++) fireEvent.click(pin(1));
    expect(screen.getByText(/emperrou/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /arrombar/i }));
    expect(loot()).toBeInTheDocument();
  });
});
