import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TriageGate, WallsGate } from "./Gates";
import { LoreSfx } from "./sound";
import { StoryGame } from "./StoryGame";

describe("lore sound", () => {
  beforeEach(() => localStorage.clear());

  it("the triage sheet scratches out lies, ticks the truth and thuds the stamp", () => {
    const sfx = vi.fn();
    render(
      <LoreSfx.Provider value={sfx}>
        <TriageGate onPass={() => {}} />
      </LoreSfx.Provider>,
    );
    const sheet = screen.getByRole("group", { name: /ficha/i });
    fireEvent.click(within(sheet).getByRole("button", { name: "óbito" }));
    fireEvent.click(within(sheet).getByRole("button", { name: "movimento após declaração de óbito" }));
    fireEvent.click(within(sheet).getByRole("button", { name: /carimbar/i }));
    expect(sfx.mock.calls.map(([name]) => name)).toEqual(["loreWrong", "loreCheck", "loreStamp"]);
  });

  it("each wall is sprayed", () => {
    const sfx = vi.fn();
    render(
      <LoreSfx.Provider value={sfx}>
        <WallsGate onPass={() => {}} />
      </LoreSfx.Provider>,
    );
    fireEvent.click(screen.getAllByRole("button", { name: /parede/i })[0]);
    expect(sfx).toHaveBeenCalledWith("loreSpray", expect.any(Number));
  });

  it("remembers when the player turns the sound off", () => {
    render(<StoryGame />);
    const toggle = screen.getByRole("button", { name: /som ligado/i });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: /som desligado/i })).toHaveAttribute("aria-pressed", "false");
    expect(localStorage.getItem("lazarus:lore:sound")).toBe("0");
  });
});
