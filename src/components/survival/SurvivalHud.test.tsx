import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { initialSurvival } from "@/lib/survival/survival";
import { DaySection } from "./DaySection";
import { SurvivalHud } from "./SurvivalHud";
import { ConnectedHud, SurvivalProvider } from "./SurvivalProvider";

describe("SurvivalHud", () => {
  it("shows day, loot and threat", () => {
    render(<SurvivalHud state={{ ...initialSurvival, day: 15 }} onSedative={() => {}} />);
    const hud = screen.getByRole("status", { name: /sobrevivente/i });
    expect(hud).toHaveTextContent("Dia 15");
    expect(hud).toHaveTextContent("Saque 42%");
    expect(hud).toHaveTextContent("Especiais, Hollow e gás");
  });

  it("folds the details away on phones until asked", async () => {
    render(<SurvivalHud state={{ ...initialSurvival, day: 15 }} onSedative={() => {}} />);
    const toggle = screen.getByRole("button", { name: "Mais" });
    expect(screen.getByText("Saque 42%").parentElement).toHaveClass("max-sm:hidden");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Saque 42%").parentElement).not.toHaveClass("max-sm:hidden");
  });

  it("hides the fear moodle while calm", () => {
    render(<SurvivalHud state={initialSurvival} onSedative={() => {}} />);
    expect(screen.queryByRole("button", { name: /sedativo/i })).not.toBeInTheDocument();
  });

  it("shows the fear moodle and lets the player take a sedative", async () => {
    const onSedative = vi.fn();
    render(<SurvivalHud state={{ ...initialSurvival, fear: 90 }} onSedative={onSedative} />);
    expect(screen.getByText("Panicked")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /sedativo/i }));
    expect(onSedative).toHaveBeenCalled();
  });
});

describe("day tracking while scrolling", () => {
  it("advances the HUD day as day sections pass the middle of the screen", () => {
    render(
      <SurvivalProvider>
        <DaySection day={0}>início</DaySection>
        <DaySection day={10}>horda</DaySection>
        <ConnectedHud />
      </SurvivalProvider>,
    );
    const [, horde] = document.querySelectorAll<HTMLElement>("[data-day]");
    vi.spyOn(horde, "getBoundingClientRect").mockReturnValue({ top: 100 } as DOMRect);

    act(() => {
      fireEvent.scroll(window);
    });

    expect(screen.getByRole("status", { name: /sobrevivente/i })).toHaveTextContent("Dia 10");
  });
});
