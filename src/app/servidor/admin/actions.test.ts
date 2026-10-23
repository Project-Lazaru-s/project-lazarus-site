import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ connect: vi.fn(), deleteRecruit: vi.fn() }));
const cache = vi.hoisted(() => ({ updateTag: vi.fn(), refresh: vi.fn() }));
const auth = vi.hoisted(() => ({ value: null as string | null }));
vi.mock("@/lib/enlist/db", () => db);
vi.mock("next/cache", () => cache);
vi.mock("next/headers", () => ({ headers: async () => new Headers(auth.value ? { authorization: auth.value } : {}) }));

const { removeRecruit } = await import("./actions");
const basic = (pass: string) => `Basic ${Buffer.from(`admin:${pass}`).toString("base64")}`;

describe("removeRecruit (server action)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("ADMIN_PASSWORD", "s3nha");
    db.connect.mockReturnValue(() => {});
  });

  it("deletes the form and refreshes the list and the public counter", async () => {
    auth.value = basic("s3nha");
    await removeRecruit(7);
    expect(db.deleteRecruit).toHaveBeenCalledWith(expect.any(Function), 7);
    expect(cache.updateTag).toHaveBeenCalledWith("recruits");
    expect(cache.refresh).toHaveBeenCalled();
  });

  it("refuses without the password or with a bad id", async () => {
    auth.value = basic("errada");
    await expect(removeRecruit(7)).rejects.toThrow(/restrita/);
    auth.value = null;
    await expect(removeRecruit(7)).rejects.toThrow(/restrita/);
    auth.value = basic("s3nha");
    await expect(removeRecruit(-1)).rejects.toThrow(/inválida/);
    expect(db.deleteRecruit).not.toHaveBeenCalled();
  });
});
