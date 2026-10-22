import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CopyButton } from "./CopyButton";
import { INSTALL_KEY, InstallChecklist } from "./InstallChecklist";

describe("CopyButton", () => {
  afterEach(() => vi.useRealTimers());

  it("copies the text and says so for a moment", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CopyButton text="level-type=cityworld:apocalypse" />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /copiar level-type/i }));
    });
    expect(writeText).toHaveBeenCalledWith("level-type=cityworld:apocalypse");
    expect(screen.getByRole("button")).toHaveTextContent(/copiado/i);
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(screen.getByRole("button")).toHaveTextContent(/copiar/i);
  });
});

describe("InstallChecklist", () => {
  beforeEach(() => localStorage.clear());

  const steps = ["Baixe o zip", "Importe no CurseForge", "Reserve 8 GB de RAM"];

  it("ticks steps and counts progress", () => {
    render(<InstallChecklist steps={steps} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Baixe o zip" }));
    expect(screen.getByRole("checkbox", { name: "Baixe o zip" })).toBeChecked();
    expect(screen.getByText("1 de 3")).toBeInTheDocument();
  });

  it("remembers the ticked steps on this browser", () => {
    const { unmount } = render(<InstallChecklist steps={steps} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Importe no CurseForge" }));
    unmount();
    render(<InstallChecklist steps={steps} />);
    expect(screen.getByRole("checkbox", { name: "Importe no CurseForge" })).toBeChecked();
    expect(JSON.parse(localStorage.getItem(INSTALL_KEY)!)).toEqual([1]);
  });

  it("congratulates when everything is done", () => {
    render(<InstallChecklist steps={steps} />);
    for (const step of steps) fireEvent.click(screen.getByRole("checkbox", { name: step }));
    expect(screen.getByText(/pronto para o dia 0/i)).toBeInTheDocument();
  });

  it("ignores a corrupted saved list", () => {
    localStorage.setItem(INSTALL_KEY, "{nope");
    render(<InstallChecklist steps={steps} />);
    expect(screen.getByText("0 de 3")).toBeInTheDocument();
  });
});
