import { describe, expect, it } from "vitest";
import { isAdmin, toCsv } from "./admin";

const basic = (user: string, pass: string) => `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;

describe("isAdmin", () => {
  it("accepts the right password with any user name", () => {
    expect(isAdmin(basic("kai", "s3nha:forte"), "s3nha:forte")).toBe(true);
  });

  it("refuses a wrong or missing password, and everyone when no password is set", () => {
    expect(isAdmin(basic("kai", "errada"), "s3nha")).toBe(false);
    expect(isAdmin(null, "s3nha")).toBe(false);
    expect(isAdmin("Bearer x", "s3nha")).toBe(false);
    expect(isAdmin(basic("kai", ""), "")).toBe(false);
  });
});

describe("toCsv", () => {
  it("builds a semicolon CSV that Excel opens as text, quoting what needs it", () => {
    const csv = toCsv([
      { nick: "Kai_D3v", whatsapp: "+5511987654321", discord: null, nota: 'diz "oi"; tchau' },
      { nick: "=HYPERLINK()", whatsapp: null, discord: "kai", nota: "" },
    ]);
    expect(csv.split("\r\n")).toEqual([
      "﻿nick;whatsapp;discord;nota",
      `Kai_D3v;'+5511987654321;;"diz ""oi""; tchau"`,
      "'=HYPERLINK();;kai;",
    ]);
  });
});
