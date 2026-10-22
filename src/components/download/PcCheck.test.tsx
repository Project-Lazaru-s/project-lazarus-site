import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PcSpecs } from "@/lib/pc-check";
import { PcCheck } from "./PcCheck";

const laptop: PcSpecs = { cores: 8, memoryGb: 8, gpu: "ANGLE (Intel(R) UHD Graphics 620 Direct3D11)", mobile: false };

describe("PcCheck", () => {
  it("measures nothing until asked, and says nothing leaves the browser", () => {
    const read = vi.fn(() => laptop);
    render(<PcCheck read={read} />);
    expect(read).not.toHaveBeenCalled();
    expect(screen.getByText(/nada é enviado/i)).toBeInTheDocument();
  });

  it("gives a verdict and the reasons behind it", () => {
    render(<PcCheck read={() => laptop} />);
    fireEvent.click(screen.getByRole("button", { name: /testar meu pc/i }));
    expect(screen.getByRole("heading", { name: /aguenta, sem shader/i })).toBeInTheDocument();
    const checks = screen.getByRole("list", { name: /o que o navegador revelou/i });
    expect(within(checks).getByText("8 núcleos")).toBeInTheDocument();
    expect(within(checks).getByText(/intel\(r\) uhd graphics 620/i)).toBeInTheDocument();
  });

  it("tells phone visitors where the game runs", () => {
    render(<PcCheck read={() => ({ ...laptop, mobile: true })} />);
    fireEvent.click(screen.getByRole("button", { name: /testar meu pc/i }));
    expect(screen.getByRole("heading", { name: /celular/i })).toBeInTheDocument();
    expect(screen.getByText(/minecraft java/i)).toBeInTheDocument();
  });
});
