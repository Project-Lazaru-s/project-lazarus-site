import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConnectedHud, SurvivalProvider } from "@/components/survival/SurvivalProvider";
import { LootGame } from "./LootGame";
import { TakedownGame } from "./TakedownGame";
import { WaterGame } from "./WaterGame";

beforeEach(() => vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] }));
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function advance(ms: number) {
  for (let i = 0; i < ms / 50; i++) {
    act(() => {
      vi.advanceTimersByTime(50);
    });
  }
}

function play(game: ReactNode) {
  render(
    <SurvivalProvider>
      {game}
      <ConnectedHud />
    </SurvivalProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: /começar/i }));
}

const hud = () => screen.getByRole("status", { name: /sobrevivente/i });

describe("WaterGame", () => {
  it("sealed water is safe", () => {
    play(<WaterGame />);
    const sealed = screen.getByRole("button", { name: /lacrada|enlatada/i });
    fireEvent.click(sealed);
    expect(screen.getByRole("heading", { name: /água limpa/i })).toBeInTheDocument();
    expect(hud()).not.toHaveTextContent("Sick");
  });

  it("dirty water can make you Sick, shown in the HUD", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    play(<WaterGame />);
    fireEvent.click(screen.getByRole("button", { name: /poça/i }));
    expect(screen.getByRole("heading", { name: /disenteria/i })).toBeInTheDocument();
    expect(hud()).toHaveTextContent("Sick");
  });

  it("taking too long means passing out from thirst", () => {
    play(<WaterGame />);
    advance(6500);
    expect(screen.getByRole("heading", { name: /desmaiou/i })).toBeInTheDocument();
    expect(hud()).toHaveTextContent("Mortes 1");
  });
});

describe("TakedownGame", () => {
  it("striking in the window finishes the infected", () => {
    play(<TakedownGame />);
    advance(300);
    fireEvent.click(screen.getByRole("button", { name: /golpear/i }));
    expect(hud()).toHaveTextContent("Abates 1");
  });

  it("striking off the window gets you bitten, then three tries end the encounter", () => {
    play(<TakedownGame />);
    const strike = screen.getByRole("button", { name: /golpear/i });
    fireEvent.click(strike);
    expect(hud()).toHaveTextContent("Infection");
    fireEvent.click(strike);
    fireEvent.click(strike);
    expect(screen.getByRole("heading", { name: /0 de 3/i })).toBeInTheDocument();
  });

  it("can be played with the space bar", () => {
    play(<TakedownGame />);
    advance(300);
    fireEvent.keyDown(screen.getByRole("application", { name: /beco/i }), { key: " " });
    expect(hud()).toHaveTextContent("Abates 1");
  });
});

describe("LootGame", () => {
  it("opens each cabinet once and keeps what it finds", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    play(<LootGame />);
    const cabinets = within(screen.getByRole("application", { name: /farmácia/i })).getAllByRole("button");
    expect(cabinets).toHaveLength(3);
    fireEvent.click(cabinets[0]);
    expect(cabinets[0]).toBeDisabled();
    expect(within(cabinets[0]).getByText(/antibiótico/i)).toBeInTheDocument();
    expect(hud()).toHaveTextContent(/antibiótico/i);
  });

  it("comes up empty when the roll misses the day's loot chance (day 40: 25%)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    render(
      <SurvivalProvider initial={{ day: 40 }}>
        <LootGame />
      </SurvivalProvider>,
    );
    expect(screen.getByText(/25% de chance/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /começar/i }));
    const [first] = within(screen.getByRole("application", { name: /farmácia/i })).getAllByRole("button");
    fireEvent.click(first);
    expect(within(first).getByText(/vazio/i)).toBeInTheDocument();
  });

  it("the antibiotic found cures the infection from the HUD", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(
      <SurvivalProvider>
        <TakedownGame />
        <LootGame />
        <ConnectedHud />
      </SurvivalProvider>,
    );
    const [startTakedown, startLoot] = screen.getAllByRole("button", { name: /começar/i });
    fireEvent.click(startTakedown);
    fireEvent.click(screen.getByRole("button", { name: /golpear/i }));
    expect(hud()).toHaveTextContent("Infection");

    fireEvent.click(startLoot);
    fireEvent.click(within(screen.getByRole("application", { name: /farmácia/i })).getAllByRole("button")[0]);
    fireEvent.click(within(hud()).getByRole("button", { name: /usar antibiótico/i }));
    expect(hud()).not.toHaveTextContent("Infection");
  });
});
