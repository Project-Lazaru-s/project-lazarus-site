import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChestGame } from "@/components/games/ChestGame";
import { ACHIEVEMENTS } from "@/lib/survival/achievements";
import { SAVE_KEY, saveRun } from "@/lib/survival/save";
import { initialSurvival } from "@/lib/survival/survival";
import { AchievementToasts } from "./AchievementToasts";
import { Dossier } from "./Dossier";
import { ResumeBanner } from "./ResumeBanner";
import { ConnectedHud, SurvivalProvider } from "./SurvivalProvider";

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

const hud = () => screen.getByRole("status", { name: /sobrevivente/i });
const saved = () => JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null");

function renderLanding() {
  render(
    <SurvivalProvider persist>
      <ResumeBanner />
      <ChestGame />
      <ConnectedHud />
      <AchievementToasts />
      <Dossier />
    </SurvivalProvider>,
  );
}

describe("saved run", () => {
  const previous = {
    ...initialSurvival,
    day: 13,
    kills: 7,
    achievements: ["silencio"],
    record: { ...initialSurvival.record, stealthClean: true, stealthBest: 8 },
  };

  it("offers to continue a saved run", () => {
    saveRun(localStorage, previous);
    renderLanding();
    const banner = screen.getByRole("region", { name: /partida salva/i });
    expect(banner).toHaveTextContent("Dia 13");
    expect(banner).toHaveTextContent("7 abates");
    expect(banner).toHaveTextContent("1 conquista");
  });

  it("continuing restores the run", () => {
    saveRun(localStorage, previous);
    renderLanding();
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
    expect(hud()).toHaveTextContent("Dia 13");
    expect(screen.queryByRole("region", { name: /partida salva/i })).not.toBeInTheDocument();
  });

  it("a new run starts over but keeps the achievements", () => {
    saveRun(localStorage, previous);
    renderLanding();
    fireEvent.click(within(screen.getByRole("region", { name: /partida salva/i })).getByRole("button", { name: /nova partida/i }));
    expect(hud()).toHaveTextContent("Dia 0");
    expect(saved()).toMatchObject({ day: 0, kills: 0, achievements: ["silencio"] });
  });

  it("does not overwrite the save before the visitor chooses", () => {
    saveRun(localStorage, previous);
    renderLanding();
    fireEvent.click(screen.getByRole("button", { name: /arrombar/i }));
    expect(saved()).toMatchObject({ day: 13, kills: 7 });
  });

  it("saves as the visitor plays when there was nothing saved", () => {
    renderLanding();
    expect(screen.queryByRole("region", { name: /partida salva/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /arrombar/i }));
    expect(saved()).toMatchObject({ record: { chest: "forced" } });
  });
});

describe("achievements", () => {
  it("announce themselves when unlocked", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // ordem secreta [1, 2, 3, 0]
    renderLanding();
    fireEvent.click(screen.getByRole("button", { name: /usar gazua/i }));
    for (const n of [2, 3, 4, 1]) fireEvent.click(screen.getByRole("button", { name: `Pino ${n}` }));
    const toasts = screen.getByRole("log", { name: /conquistas/i });
    expect(within(toasts).getByText("Mestre da gazua")).toBeInTheDocument();
  });

  it("are listed in the dossier, locked and unlocked", () => {
    render(
      <SurvivalProvider initial={{ achievements: ["silencio"] }}>
        <Dossier />
      </SurvivalProvider>,
    );
    const list = screen.getByRole("list", { name: /conquistas/i });
    expect(within(list).getAllByRole("listitem")).toHaveLength(ACHIEVEMENTS.length);
    expect(within(list).getByText("Silêncio absoluto").closest("li")).toHaveAttribute("data-unlocked", "true");
    expect(within(list).getByText("Mãos limpas").closest("li")).toHaveAttribute("data-unlocked", "false");
    expect(screen.getByText(`1 de ${ACHIEVEMENTS.length}`)).toBeInTheDocument();
  });

  it("the dossier can start a new run", () => {
    render(
      <SurvivalProvider initial={{ day: 20, kills: 5, achievements: ["silencio"] }}>
        <Dossier />
        <ConnectedHud />
      </SurvivalProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /nova partida/i }));
    expect(hud()).toHaveTextContent("Dia 0");
    expect(screen.getByText(`1 de ${ACHIEVEMENTS.length}`)).toBeInTheDocument();
  });
});
