import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ambientZombieCount, MAX_AMBIENT } from "@/lib/survival/scenery";
import { AmbientZombies } from "./AmbientZombies";
import { DayStamp } from "./DayStamp";
import { ConnectedHud, SurvivalProvider, useSurvival } from "./SurvivalProvider";

function SkipTo({ day }: { day: number }) {
  const { dispatch } = useSurvival();
  return <button onClick={() => dispatch({ type: "day", day })}>Ir para o dia {day}</button>;
}

const hud = () => screen.getByRole("status", { name: /sobrevivente/i });
const street = () => screen.queryAllByRole("button", { name: /infectado na rua/i });

describe("DayStamp", () => {
  it("stays out of the way on day 0", () => {
    const { container } = render(
      <SurvivalProvider>
        <DayStamp />
      </SurvivalProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("stamps the new day and its threat when the day turns", () => {
    render(
      <SurvivalProvider>
        <DayStamp />
        <SkipTo day={10} />
      </SurvivalProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /dia 10/i }));
    expect(screen.getByText("Dia 10")).toBeInTheDocument();
    expect(screen.getByText("Primeira horda")).toBeInTheDocument();
  });
});

describe("AmbientZombies", () => {
  it("fills the street as the days go by", () => {
    render(
      <SurvivalProvider>
        <AmbientZombies />
        <SkipTo day={20} />
      </SurvivalProvider>,
    );
    expect(street()).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: /dia 20/i }));
    expect(street()).toHaveLength(ambientZombieCount(20));
  });

  it("a click is a bonus kill, but the noise draws one more", () => {
    render(
      <SurvivalProvider initial={{ day: 10 }}>
        <AmbientZombies />
        <ConnectedHud />
      </SurvivalProvider>,
    );
    const before = street().length;
    fireEvent.click(street()[0]);
    expect(hud()).toHaveTextContent("Abates 1");
    expect(street().filter((z) => z.dataset.dead !== "true")).toHaveLength(before);
    expect(street().filter((z) => z.dataset.dead === "true")).toHaveLength(1);
  });

  it("never crowds past the cap", () => {
    render(
      <SurvivalProvider initial={{ day: 60 }}>
        <AmbientZombies />
      </SurvivalProvider>,
    );
    for (let i = 0; i < 5; i++) fireEvent.click(street().find((z) => z.dataset.dead !== "true")!);
    expect(street().filter((z) => z.dataset.dead !== "true").length).toBeLessThanOrEqual(MAX_AMBIENT);
  });
});
