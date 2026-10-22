import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dossier } from "@/components/survival/Dossier";
import { ConnectedHud, SurvivalProvider } from "@/components/survival/SurvivalProvider";
import { HordeGame } from "./HordeGame";
import { StealthGame } from "./StealthGame";

beforeEach(() => vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] }));
afterEach(() => vi.useRealTimers());

function advance(seconds: number) {
  for (let i = 0; i < seconds * 20; i++) {
    act(() => {
      vi.advanceTimersByTime(50);
    });
  }
}

function renderGame(game: React.ReactNode) {
  render(
    <SurvivalProvider>
      {game}
      <ConnectedHud />
      <Dossier />
    </SurvivalProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: /começar/i }));
}

const hud = () => screen.getByRole("status", { name: /sobrevivente/i });

describe("StealthGame", () => {
  it("crossing crouched gets you to the other side", () => {
    renderGame(<StealthGame />);
    fireEvent.pointerDown(screen.getByRole("button", { name: /agachar/i }));
    advance(11);
    expect(screen.getByRole("heading", { name: /atravessou/i })).toBeInTheDocument();
    expect(screen.getByText("Melhor travessia").nextElementSibling).toHaveTextContent(/\d,\d s/);
  });

  it("running gets you spotted, and the death counts", () => {
    renderGame(<StealthGame />);
    fireEvent.pointerDown(screen.getByRole("button", { name: /correr/i }));
    advance(5);
    expect(screen.getByRole("heading", { name: /avistado/i })).toBeInTheDocument();
    expect(hud()).toHaveTextContent("Mortes 1");
  });

  it("can be played from the keyboard", () => {
    renderGame(<StealthGame />);
    const scene = screen.getByRole("application", { name: /rua/i });
    fireEvent.keyDown(scene, { key: "1" });
    advance(11);
    expect(screen.getByRole("heading", { name: /atravessou/i })).toBeInTheDocument();
  });

  it("can be skipped", () => {
    render(
      <SurvivalProvider>
        <StealthGame />
      </SurvivalProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /pular/i }));
    expect(screen.queryByRole("button", { name: /começar/i })).not.toBeInTheDocument();
    expect(screen.getByText(/pulou/i)).toBeInTheDocument();
  });
});

describe("HordeGame", () => {
  it("shoots an infected in the head from the keyboard and counts the kill", () => {
    renderGame(<HordeGame />);
    const scene = screen.getByRole("application", { name: /horda/i });
    const before = within(scene).getAllByRole("button", { name: /walker/i });
    fireEvent.click(before[0], { detail: 0 });
    expect(within(scene).getAllByRole("button", { name: /walker/i })).toHaveLength(before.length - 1);
    expect(hud()).toHaveTextContent("Abates 1");
  });

  it("spends ammo on every shot", () => {
    renderGame(<HordeGame />);
    const ammo = () => Number(screen.getByText(/munição/i).textContent?.match(/\d+/)?.[0]);
    const start = ammo();
    fireEvent.click(screen.getByRole("application", { name: /horda/i }));
    expect(ammo()).toBe(start - 1);
  });

  it("falls when the horde reaches the barricade", () => {
    renderGame(<HordeGame />);
    advance(15);
    expect(screen.getByRole("heading", { name: /barricada caiu/i })).toBeInTheDocument();
    expect(hud()).toHaveTextContent("Mortes 1");
  });
});
