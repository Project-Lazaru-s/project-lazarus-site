import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { encodeCard } from "@/lib/enlist/enlist";
import CardPage, { generateMetadata, generateStaticParams } from "./page";

const code = encodeCard({ number: 42, nick: "Kai_D3v", side: "f1041" });
const props = (code: string) => ({ params: Promise.resolve({ code }) }) as PageProps<"/servidor/ficha/[code]">;

describe("/servidor/ficha/[code]", () => {
  it("shows the enlisted card and invites the visitor to enlist", async () => {
    render(await CardPage(props(code)));
    expect(screen.getByText("Ficha nº 42")).toBeInTheDocument();
    expect(screen.getByText("Lado: 104.1 · Bando")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /alistar-se também/i })).toHaveAttribute("href", "/servidor");
  });

  it("answers 404 for a forged code", async () => {
    await expect(CardPage(props("forjado"))).rejects.toThrow();
  });

  it("describes the card for link previews", async () => {
    expect((await generateMetadata(props(code))).title).toBe("Kai_D3v se alistou: 104.1 · Bando");
    expect(generateStaticParams()).toHaveLength(1);
  });
});
