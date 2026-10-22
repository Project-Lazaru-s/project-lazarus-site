import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isReckless, lightSpeed, NIGHT_FROM_DAY } from "@/lib/survival/flashlight";
import { Flashlight } from "./Flashlight";
import { ConnectedHud, SurvivalProvider } from "./SurvivalProvider";

afterEach(() => vi.restoreAllMocks());

describe("lightSpeed / isReckless", () => {
  it("measures how fast the beam moves", () => {
    expect(lightSpeed(300, 400, 500)).toBe(1000);
    expect(lightSpeed(10, 0, 0)).toBe(0);
  });

  it("only a frantic sweep gives you away", () => {
    expect(isReckless(lightSpeed(60, 0, 100))).toBe(false);
    expect(isReckless(lightSpeed(900, 0, 100))).toBe(true);
  });
});

function renderAt(day: number) {
  render(
    <SurvivalProvider initial={{ day }}>
      <Flashlight>
        <p>Dentro da seção</p>
      </Flashlight>
      <ConnectedHud />
    </SurvivalProvider>,
  );
}

const darkness = () => document.querySelector("[data-flashlight]");

describe("Flashlight", () => {
  it("does nothing before night falls", () => {
    renderAt(NIGHT_FROM_DAY - 1);
    expect(darkness()).toBeNull();
    expect(screen.getByText("Dentro da seção")).toBeInTheDocument();
  });

  it("turns the section dark from day 10, with a way to switch the light on", () => {
    renderAt(NIGHT_FROM_DAY);
    expect(darkness()).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /acender a luz/i }));
    expect(darkness()).toBeNull();
    expect(screen.getByRole("button", { name: /usar a lanterna/i })).toBeInTheDocument();
  });

  it("a calm beam goes unnoticed, a frantic one scares you", () => {
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => now);
    renderAt(NIGHT_FROM_DAY);
    const area = darkness()!.parentElement!;

    fireEvent.pointerMove(area, { clientX: 100, clientY: 100 });
    now = 500;
    fireEvent.pointerMove(area, { clientX: 130, clientY: 100 });
    expect(screen.queryByText(/eles viram a luz/i)).not.toBeInTheDocument();

    now = 550;
    fireEvent.pointerMove(area, { clientX: 900, clientY: 100 });
    expect(screen.getByText(/eles viram a luz/i)).toBeInTheDocument();
    expect(screen.getByRole("status", { name: /sobrevivente/i })).toHaveTextContent(/Tense|Fearful|Panicked/);
  });
});
