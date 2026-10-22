import { describe, expect, it } from "vitest";
import { formatBytes, formatDate } from "./format";

describe("formatDate", () => {
  it("formats ISO dates in PT-BR, ignoring the local timezone", () => {
    expect(formatDate("2026-10-22T06:16:35Z")).toBe("22 de outubro de 2026");
    expect(formatDate("2026-10-22")).toBe("22 de outubro de 2026");
  });
});

describe("formatBytes", () => {
  it("formats sizes in decimal megabytes with a PT-BR comma", () => {
    expect(formatBytes(13_031_141)).toBe("13,0 MB");
    expect(formatBytes(512_000)).toBe("0,5 MB");
  });
});
