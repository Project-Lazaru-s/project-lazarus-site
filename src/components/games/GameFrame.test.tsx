import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GameFrame, type Phase } from "./GameFrame";

const frame = (phase: Phase) =>
  render(
    <GameFrame title="Teste" intro="..." phase={phase} onStart={() => {}} onSkip={() => {}}>
      <div />
    </GameFrame>,
  ).container.firstElementChild;

describe("GameFrame", () => {
  it("flags a running encounter so overlays can stay out of its way", () => {
    expect(frame("playing")).toHaveAttribute("data-playing", "true");
  });

  it("is not flagged before or after playing", () => {
    expect(frame("intro")).not.toHaveAttribute("data-playing");
  });
});
