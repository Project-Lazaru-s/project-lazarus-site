import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialSurvival } from "@/lib/survival/survival";
import { SurvivalHud } from "./SurvivalHud";
import { ConnectedHud, SurvivalProvider } from "./SurvivalProvider";

const meter = (name: RegExp) => screen.getByRole("meter", { name });

describe("needs in the HUD", () => {
  it("shows thirst and hunger as meters", () => {
    render(<SurvivalHud state={{ ...initialSurvival, thirst: 40, hunger: 90 }} onSedative={() => {}} />);
    expect(meter(/sede/i)).toHaveAttribute("aria-valuenow", "40");
    expect(meter(/fome/i)).toHaveAttribute("aria-valuenow", "90");
  });

  it("shows the needs moodles when low", () => {
    render(<SurvivalHud state={{ ...initialSurvival, thirst: 0, hunger: 20 }} onSedative={() => {}} />);
    expect(screen.getByText("Dehydrated")).toBeInTheDocument();
    expect(screen.getByText("Hungry")).toBeInTheDocument();
  });

  it("offers to drink and eat what is in the backpack, only when needed", () => {
    const onUse = vi.fn();
    const { rerender } = render(
      <SurvivalHud
        state={{ ...initialSurvival, thirst: 30, hunger: 100, inventory: ["water", "food"] }}
        onSedative={() => {}}
        onUse={onUse}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /beber água/i }));
    expect(onUse).toHaveBeenCalledWith("water");
    expect(screen.queryByRole("button", { name: /comer/i })).not.toBeInTheDocument();

    rerender(
      <SurvivalHud state={{ ...initialSurvival, hunger: 40, inventory: ["food"] }} onSedative={() => {}} onUse={onUse} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /comer/i }));
    expect(onUse).toHaveBeenCalledWith("food");
  });
});

describe("the landing clock", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("drains thirst while the page is open", () => {
    render(
      <SurvivalProvider clock>
        <ConnectedHud />
      </SurvivalProvider>,
    );
    act(() => {
      vi.advanceTimersByTime(120_000);
    });
    expect(Number(meter(/sede/i).getAttribute("aria-valuenow"))).toBeLessThan(100);
  });

  it("stops while the tab is hidden", () => {
    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    render(
      <SurvivalProvider clock>
        <ConnectedHud />
      </SurvivalProvider>,
    );
    act(() => {
      vi.advanceTimersByTime(120_000);
    });
    expect(meter(/sede/i)).toHaveAttribute("aria-valuenow", "100");
    visibility.mockRestore();
  });

  it("does not run outside the landing", () => {
    render(
      <SurvivalProvider>
        <ConnectedHud />
      </SurvivalProvider>,
    );
    act(() => {
      vi.advanceTimersByTime(120_000);
    });
    expect(within(screen.getByRole("status", { name: /sobrevivente/i })).getByRole("meter", { name: /sede/i })).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });
});
