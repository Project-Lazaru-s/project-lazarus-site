import { beforeEach, describe, expect, it, vi } from "vitest";
import { decodeCard, type EnlistInput } from "@/lib/enlist/enlist";

const db = vi.hoisted(() => ({ connect: vi.fn(), saveRecruit: vi.fn() }));
const cache = vi.hoisted(() => ({ updateTag: vi.fn() }));
vi.mock("@/lib/enlist/db", () => db);
vi.mock("next/cache", () => cache);
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }) }));

const { enlist } = await import("./actions");

const input: EnlistInput = {
  nick: "Kai_D3v",
  email: "recruta@example.com",
  whatsapp: "11987654321",
  discord: "",
  side: "wardens",
  experience: "veterano",
  region: "sul",
  playtime: "noite",
  groupSize: "",
  consent: true,
  website: "",
};

describe("enlist (server action)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.connect.mockReturnValue(() => {});
  });

  it("saves a valid form, refreshes the counter and returns a shareable card code", async () => {
    db.saveRecruit.mockResolvedValue({ number: 42, updated: false });
    const result = await enlist(input);
    expect(result).toMatchObject({ ok: true, number: 42, updated: false });
    expect(decodeCard((result as { code: string }).code)).toEqual({ number: 42, nick: "Kai_D3v", side: "wardens" });
    expect(cache.updateTag).toHaveBeenCalledWith("recruits");
    const [, data, ipHash] = db.saveRecruit.mock.calls[0];
    expect(data).toMatchObject({ whatsapp: "+5511987654321" });
    expect(ipHash).toMatch(/^[0-9a-f]{32}$/);
    expect(ipHash).not.toContain("203.0.113.7");
  });

  it("validates on the server too, without touching the database", async () => {
    const result = await enlist({ ...input, nick: "a" });
    expect(result).toMatchObject({ ok: false, errors: { nick: expect.any(String) } });
    expect(db.saveRecruit).not.toHaveBeenCalled();
  });

  it("pretends to succeed for bots and stores nothing", async () => {
    expect(await enlist({ ...input, website: "spam" })).toMatchObject({ ok: true });
    expect(db.saveRecruit).not.toHaveBeenCalled();
  });

  it("explains a taken nick, the hourly limit and a closed enlistment", async () => {
    db.saveRecruit.mockResolvedValueOnce({ error: "nick" });
    expect(await enlist(input)).toMatchObject({ ok: false, errors: { nick: /já está alistado/ } });
    db.saveRecruit.mockResolvedValueOnce({ error: "rate" });
    expect(await enlist(input)).toMatchObject({ ok: false, message: /muitas fichas/i });
    db.connect.mockReturnValue(null);
    expect(await enlist(input)).toMatchObject({ ok: false, message: /ainda não está aberto/ });
  });
});
