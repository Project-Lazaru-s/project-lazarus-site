import { describe, expect, it } from "vitest";
import { DIAL, STATIONS, staticky, tune } from "./dial";

describe("recruitment dial", () => {
  it("hides the three player factions on the dial, not the lone wolf", () => {
    expect(STATIONS.map((s) => s.freq)).toEqual([87.3, 104.1, 121.5]);
    for (const s of STATIONS) expect(s.freq).toBeGreaterThan(DIAL.min);
  });

  it("locks on a station only close to its frequency", () => {
    expect(tune(104.1)).toMatchObject({ station: { id: "f1041" }, strength: 1, locked: true });
    expect(tune(121.4)).toMatchObject({ station: { id: "f1215" }, locked: true });
    expect(tune(103.5)).toMatchObject({ station: { id: "f1041" }, locked: false });
    expect(tune(DIAL.start).strength).toBe(0);
  });

  it("covers the message with static as the signal fades", () => {
    expect(staticky("posto 87", 1)).toBe("posto 87");
    expect(staticky("posto 87", 0)).toBe("▒▒▒▒▒ ▒▒");
  });
});
