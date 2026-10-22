import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ambientZombieCount } from "@/lib/survival/scenery";
import { KEY_DAYS } from "@/lib/survival/progression";
import { DaySlider } from "./DaySlider";

const slider = () => screen.getByRole("slider", { name: /dia/i });
const stat = (name: RegExp) => screen.getByText(name, { selector: "dt" }).nextElementSibling;
const setDay = (day: number) => fireEvent.change(slider(), { target: { value: String(day) } });

describe("DaySlider", () => {
  it("starts on day 0, with full loot and few walkers", () => {
    render(<DaySlider />);
    expect(slider()).toHaveValue("0");
    expect(stat(/locais comuns/i)).toHaveTextContent("100%");
    expect(screen.getByRole("list", { name: /ameaças/i })).toHaveTextContent("Poucos walkers");
  });

  it("shows how the world looks on the chosen day", () => {
    render(<DaySlider />);
    setDay(15);
    expect(screen.getByRole("heading", { name: "Dia 15" })).toBeInTheDocument();
    expect(stat(/locais comuns/i)).toHaveTextContent("42%");
    expect(stat(/locais arriscados/i)).toHaveTextContent("62%");
    expect(stat(/teto de hostis/i)).toHaveTextContent(/sem número/i);
  });

  it("gives the hostile cap where the table has one", () => {
    render(<DaySlider />);
    setDay(45);
    expect(stat(/teto de hostis/i)).toHaveTextContent("90");
  });

  it("marks what starts on that exact day", () => {
    render(<DaySlider />);
    setDay(14);
    const fresh = within(screen.getByRole("list", { name: /ameaças/i })).getByText("Runners em dobro.").closest("li");
    expect(fresh).toHaveTextContent("Novo");
  });

  it("fills the street with infected as the days go by", () => {
    render(<DaySlider />);
    setDay(30);
    expect(screen.getByRole("img", { name: /rua no dia 30/i })).toHaveAccessibleName(
      `Rua no dia 30 com ${ambientZombieCount(30)} infectados`,
    );
  });

  it("jumps to the days where something changes", () => {
    render(<DaySlider />);
    const shortcuts = screen.getByRole("group", { name: /dias importantes/i });
    expect(within(shortcuts).getAllByRole("button")).toHaveLength(KEY_DAYS.length);
    fireEvent.click(within(shortcuts).getByRole("button", { name: "10" }));
    expect(slider()).toHaveValue("10");
    expect(within(shortcuts).getByRole("button", { name: "10" })).toHaveAttribute("aria-pressed", "true");
  });
});
