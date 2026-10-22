import { describe, expect, it } from "vitest";
import { heardBy, rms, smoothRadius, VOICE_LEVELS, voiceLevel } from "./voice";

describe("rms", () => {
  it("measures how loud a chunk of audio is", () => {
    expect(rms(new Float32Array(128))).toBe(0);
    expect(rms(Float32Array.from({ length: 128 }, (_, i) => (i % 2 ? 0.5 : -0.5)))).toBeCloseTo(0.5);
  });
});

describe("voiceLevel (Lazarus Stealth: whisper 2.5, talk 10, shout 18 blocks)", () => {
  it("maps loudness to the in-game noise radius", () => {
    expect(voiceLevel(0.005).radius).toBe(0);
    expect(voiceLevel(0.03).radius).toBe(2.5);
    expect(voiceLevel(0.1).radius).toBe(10);
    expect(voiceLevel(0.4).radius).toBe(18);
  });

  it("names every level", () => {
    expect(VOICE_LEVELS.map((l) => l.name)).toEqual(["Silêncio", "Sussurro", "Fala", "Grito"]);
  });

  it("can be calibrated for quiet or hot microphones", () => {
    expect(voiceLevel(0.03, 1).radius).toBe(2.5);
    expect(voiceLevel(0.03, 4).radius).toBe(10);
  });
});

describe("smoothRadius", () => {
  it("jumps up at once but fades out slowly, so a shout is not lost between frames", () => {
    expect(smoothRadius(2.5, 18, 0.016)).toBe(18);
    const after = smoothRadius(18, 0, 0.1);
    expect(after).toBeLessThan(18);
    expect(after).toBeGreaterThan(10);
    expect(smoothRadius(1, 0, 1)).toBe(0);
  });
});

describe("heardBy", () => {
  it("lists which infected are inside the voice radius", () => {
    expect(heardBy([4, 9, 15], 0)).toEqual([false, false, false]);
    expect(heardBy([4, 9, 15], 10)).toEqual([true, true, false]);
    expect(heardBy([4, 9, 15], 18)).toEqual([true, true, true]);
  });
});
