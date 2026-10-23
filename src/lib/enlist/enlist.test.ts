import { describe, expect, it } from "vitest";
import { decodeCard, encodeCard, normalizeWhatsapp, validate } from "./enlist";

const valid = {
  nick: "Kai_D3v",
  email: "Recruta@Example.com ",
  whatsapp: "(11) 98765-4321",
  discord: "",
  side: "rovers",
  experience: "ja-joguei",
  region: "sudeste",
  playtime: "noite",
  groupSize: "",
  consent: true,
  website: "",
};

describe("validate", () => {
  it("accepts a complete form and normalizes it", () => {
    const result = validate(valid);
    expect(result).toEqual({
      ok: true,
      data: {
        nick: "Kai_D3v",
        email: "recruta@example.com",
        whatsapp: "+5511987654321",
        discord: null,
        side: "rovers",
        experience: "ja-joguei",
        region: "sudeste",
        playtime: "noite",
        groupSize: null,
      },
    });
  });

  it("checks the Minecraft Java nick format", () => {
    for (const nick of ["ab", "nick com espaço", "x".repeat(17), "kai-dev"]) {
      expect(validate({ ...valid, nick })).toMatchObject({ ok: false, errors: { nick: expect.any(String) } });
    }
  });

  it("requires a valid e-mail and the consent", () => {
    expect(validate({ ...valid, email: "sem-arroba" })).toMatchObject({ errors: { email: expect.any(String) } });
    expect(validate({ ...valid, consent: false })).toMatchObject({ errors: { consent: expect.any(String) } });
  });

  it("keeps WhatsApp and Discord optional, but valid when given", () => {
    expect(validate({ ...valid, whatsapp: "" })).toMatchObject({ ok: true, data: { whatsapp: null } });
    expect(validate({ ...valid, whatsapp: "123" })).toMatchObject({ errors: { whatsapp: expect.any(String) } });
    expect(validate({ ...valid, discord: "lazarus.fan" })).toMatchObject({
      ok: true,
      data: { discord: "lazarus.fan" },
    });
    expect(validate({ ...valid, discord: "a" })).toMatchObject({ errors: { discord: expect.any(String) } });
  });

  it("only accepts known choices", () => {
    expect(validate({ ...valid, side: "military" })).toMatchObject({ errors: { side: expect.any(String) } });
    expect(validate({ ...valid, region: "marte" })).toMatchObject({ errors: { region: expect.any(String) } });
  });

  it("asks the group size only from who founds a faction", () => {
    expect(validate({ ...valid, side: "fundar" })).toMatchObject({ errors: { groupSize: expect.any(String) } });
    expect(validate({ ...valid, side: "fundar", groupSize: "6" })).toMatchObject({ ok: true, data: { groupSize: 6 } });
    expect(validate({ ...valid, side: "rovers", groupSize: "6" })).toMatchObject({
      ok: true,
      data: { groupSize: null },
    });
  });

  it("flags bots that fill the hidden field", () => {
    expect(validate({ ...valid, website: "http://spam" })).toEqual({ ok: false, bot: true, errors: {} });
  });
});

describe("normalizeWhatsapp", () => {
  it("adds the Brazilian country code to local numbers and keeps international ones", () => {
    expect(normalizeWhatsapp("11 98765 4321")).toBe("+5511987654321");
    expect(normalizeWhatsapp("+351 912 345 678")).toBe("+351912345678");
    expect(normalizeWhatsapp("98765")).toBeNull();
  });
});

describe("enlistment card", () => {
  it("round-trips the number, nick and side for sharing, and rejects forged codes", () => {
    const code = encodeCard({ number: 137, nick: "Kai_D3v", side: "rovers" });
    expect(decodeCard(code)).toEqual({ number: 137, nick: "Kai_D3v", side: "rovers" });
    expect(decodeCard("lixo")).toBeNull();
    expect(decodeCard(encodeCard({ number: 1, nick: "x y", side: "rovers" }))).toBeNull();
  });
});
