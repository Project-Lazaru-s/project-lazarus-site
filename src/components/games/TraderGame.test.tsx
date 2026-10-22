import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dossier } from "@/components/survival/Dossier";
import { ConnectedHud, SurvivalProvider } from "@/components/survival/SurvivalProvider";
import type { SurvivalState } from "@/lib/survival/survival";
import { HordeGame } from "./HordeGame";
import { TraderGame } from "./TraderGame";

afterEach(() => vi.restoreAllMocks());

function play(initial: Partial<SurvivalState> = {}) {
  render(
    <SurvivalProvider initial={initial}>
      <TraderGame />
      <ConnectedHud />
      <Dossier />
    </SurvivalProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: /começar/i }));
}

const hud = () => screen.getByRole("status", { name: /sobrevivente/i });
const camp = () => screen.getByRole("application", { name: /acampamento/i });
const press = (name: RegExp) => fireEvent.click(within(camp()).getByRole("button", { name }));

describe("TraderGame", () => {
  it("a fair trade swaps your item for what you asked and improves the reputation", () => {
    play({ inventory: ["bandage"] });
    press(/^antibiótico$/i);
    press(/oferecer bandagem/i);
    press(/^trocar$/i);
    expect(within(hud()).getByRole("list", { name: /inventário/i })).toHaveTextContent(/antibiótico/i);
    expect(within(hud()).getByRole("list", { name: /inventário/i })).not.toHaveTextContent(/bandagem/i);
    expect(within(camp()).getByText(/rovers \+10/i)).toBeInTheDocument();
  });

  it("you cannot trade with empty hands", () => {
    play();
    expect(within(camp()).getByRole("button", { name: /^trocar$/i })).toBeDisabled();
    expect(within(camp()).getByRole("button", { name: /^intimidar$/i })).toBeEnabled();
  });

  it("intimidating twice makes you wanted, and fighting the squad can win", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    play();
    press(/^intimidar$/i);
    press(/^intimidar$/i);
    expect(screen.getByRole("heading", { name: /procurado/i })).toBeInTheDocument();
    expect(hud()).toHaveTextContent(/procurado/i);

    vi.spyOn(Math, "random").mockReturnValue(0.1);
    press(/^lutar$/i);
    expect(screen.getByRole("heading", { name: /esquadrão abatido/i })).toBeInTheDocument();
    expect(hud()).toHaveTextContent("Abates 3");
    expect(screen.getByText("Rovers").nextElementSibling).toHaveTextContent("-60 · procurado");
  });

  it("the Haven pardon needs two supplies", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    play({ inventory: ["bandage"], reputation: -30 });
    press(/^intimidar$/i);
    expect(within(camp()).getByRole("button", { name: /perdão/i })).toBeDisabled();
  });

  it("leaving ends the encounter", () => {
    play();
    press(/seguir viagem/i);
    expect(screen.getByRole("heading", { name: /mãos vazias/i })).toBeInTheDocument();
  });
});

describe("ammo from the backpack", () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] }));
  afterEach(() => vi.useRealTimers());

  it("is loaded into the horde run", () => {
    const ammo = () => Number(screen.getByText(/munição \d+/i).textContent?.match(/\d+/)?.[0]);
    render(
      <SurvivalProvider initial={{ inventory: ["ammo"] }}>
        <HordeGame />
        <ConnectedHud />
      </SurvivalProvider>,
    );
    const base = ammo();
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /começar/i }));
    });
    expect(ammo()).toBe(base + 8);
    expect(within(hud()).queryByRole("list", { name: /inventário/i })).not.toBeInTheDocument();
  });
});
