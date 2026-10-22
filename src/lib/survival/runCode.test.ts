import { describe, expect, it } from "vitest";
import { decodeRun, encodeRun } from "./runCode";
import { initialSurvival, type SurvivalState } from "./survival";

const run: SurvivalState = {
  ...initialSurvival,
  day: 60,
  kills: 23,
  deaths: 2,
  reputation: -60,
  stomach: "severe",
  infected: true,
  record: { stealthBest: 7.4, hordesHeld: 3, takedowns: 2, lootOpened: 6, lootFound: 2, wanted: true },
};

describe("encodeRun / decodeRun", () => {
  it("round-trips the parts of a run the dossier shows", () => {
    const decoded = decodeRun(encodeRun(run))!;
    expect(decoded).toMatchObject({
      day: 60,
      kills: 23,
      deaths: 2,
      reputation: -60,
      stomach: "severe",
      infected: true,
      record: run.record,
    });
  });

  it("round-trips a run that played nothing", () => {
    expect(decodeRun(encodeRun(initialSurvival))).toMatchObject({
      day: 0,
      record: { stealthBest: null, wanted: false },
      stomach: "ok",
    });
  });

  it("is short and URL-safe", () => {
    const code = encodeRun(run);
    expect(code).toMatch(/^[a-z0-9-]+$/);
    expect(code.length).toBeLessThan(40);
  });

  it.each([
    ["garbage", "não-é-um-código"],
    ["too few parts", "1-2-3"],
    ["a day past 60", encodeRun({ ...run, day: 61 })],
    ["absurd kills", encodeRun({ ...run, kills: 100_000 })],
    ["more loot found than opened", encodeRun({ ...run, record: { ...run.record, lootFound: 9, lootOpened: 1 } })],
    ["empty", ""],
  ])("rejects %s", (_, code) => {
    expect(decodeRun(code)).toBeNull();
  });
});
