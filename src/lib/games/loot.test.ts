import { describe, expect, it } from "vitest";
import { openCabinet, PHARMACY_LOOT } from "./loot";

const always = (value: number) => () => value;

describe("loot", () => {
  it("finds something when the roll is under the day's loot chance", () => {
    expect(openCabinet(100, always(0))).toBe(PHARMACY_LOOT[0]);
    expect(openCabinet(42, always(0.41))).not.toBeNull();
  });

  it("comes up empty when the roll is over it", () => {
    expect(openCabinet(42, always(0.43))).toBeNull();
    expect(openCabinet(25, always(0.5))).toBeNull();
  });

  it("only has pharmacy items", () => {
    expect(PHARMACY_LOOT).toEqual(expect.arrayContaining(["antibiotic", "painkiller", "bandage", "water"]));
  });
});
