import { describe, expect, it } from "vitest";
import { DEHYDRATED_AT, drink, pickSources, WATER_SOURCES } from "./water";

const always = (value: number) => () => value;

describe("water", () => {
  it("sealed water is always safe", () => {
    for (const source of ["bottle", "can"] as const) {
      expect(drink(source, 1, always(0))).toBe("safe");
    }
  });

  it("dirty water can give dysentery", () => {
    expect(drink("puddle", 1, always(0))).toBe("sick");
    expect(drink("puddle", 1, always(0.99))).toBe("safe");
  });

  it("drinking dirty water already dehydrated makes it severe", () => {
    expect(drink("river", DEHYDRATED_AT + 0.1, always(0))).toBe("severe");
  });

  it("the puddle is riskier than the cauldron", () => {
    const risk = (id: string) => WATER_SOURCES.find((s) => s.id === id)!.risk;
    expect(risk("puddle")).toBeGreaterThan(risk("cauldron"));
  });

  it("each round offers four sources and exactly one sealed", () => {
    for (const seed of [0, 0.3, 0.6, 0.9]) {
      const sources = pickSources(always(seed));
      expect(sources).toHaveLength(4);
      expect(new Set(sources.map((s) => s.id)).size).toBe(4);
      expect(sources.filter((s) => s.risk === 0)).toHaveLength(1);
    }
  });
});
