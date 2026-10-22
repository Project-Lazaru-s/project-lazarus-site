import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DaySection } from "@/components/survival/DaySection";
import { SurvivalProvider, useSurvival } from "@/components/survival/SurvivalProvider";
import { interruptFor, radioInterrupts } from "@/content/radio";
import { RadioInterrupt } from "./RadioInterrupt";

const LANDING_DAYS = [0, 3, 4, 5, 6, 7, 10, 13, 15, 20, 60];

function SkipTo({ day }: { day: number }) {
  const { dispatch } = useSurvival();
  return <button onClick={() => dispatch({ type: "day", day })}>Pular para o dia {day}</button>;
}

describe("radioInterrupts", () => {
  it("come in day order and point at real landing sections", () => {
    const days = radioInterrupts.map((r) => r.day);
    expect(days).toEqual([...days].sort((a, b) => a - b));
    for (const r of radioInterrupts) {
      expect(r.message.startsWith("[RADIO] kssh...")).toBe(true);
      expect(LANDING_DAYS).toContain(r.target);
    }
  });

  it("the latest one heard so far is the one on air", () => {
    expect(interruptFor(0)).toBeNull();
    const first = radioInterrupts[0];
    expect(interruptFor(first.day)).toBe(first);
    expect(interruptFor(60)).toBe(radioInterrupts.at(-1));
  });
});

describe("RadioInterrupt", () => {
  it("is silent on day 0", () => {
    render(
      <SurvivalProvider>
        <RadioInterrupt />
      </SurvivalProvider>,
    );
    expect(screen.queryByRole("log", { name: /transmissão/i })).not.toBeInTheDocument();
  });

  it("breaks in when the day comes, and takes you there", () => {
    const radio = radioInterrupts[1];
    const scroll = vi.fn();
    render(
      <SurvivalProvider>
        <DaySection day={radio.target}>alvo</DaySection>
        <RadioInterrupt />
        <SkipTo day={radio.day} />
      </SurvivalProvider>,
    );
    const target = document.querySelector<HTMLElement>(`[data-day="${radio.target}"]`)!;
    target.scrollIntoView = scroll;

    fireEvent.click(screen.getByRole("button", { name: `Pular para o dia ${radio.day}` }));
    expect(screen.getByRole("log", { name: /transmissão/i })).toHaveTextContent(radio.message);
    fireEvent.click(screen.getByRole("button", { name: /sintonizar/i }));
    expect(scroll).toHaveBeenCalled();
  });
});
