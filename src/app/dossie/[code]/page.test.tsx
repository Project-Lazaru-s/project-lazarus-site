import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { encodeRun } from "@/lib/survival/runCode";
import { initialSurvival } from "@/lib/survival/survival";
import DossierPage, { generateMetadata, generateStaticParams } from "./page";

const veteran = encodeRun({
  ...initialSurvival,
  day: 60,
  kills: 14,
  deaths: 1,
  record: { ...initialSurvival.record, stealthBest: 7.4, hordesHeld: 2, takedowns: 2 },
});
const props = (code: string) => ({ params: Promise.resolve({ code }) }) as PageProps<"/dossie/[code]">;

describe("/dossie/[code]", () => {
  it("shows the shared run with its title, recomputed from the numbers", async () => {
    render(await DossierPage(props(veteran)));
    expect(screen.getByRole("heading", { name: "Veterano" })).toBeInTheDocument();
    expect(screen.getByText("Abates").nextElementSibling).toHaveTextContent("14");
  });

  it("invites the visitor to try and to download", async () => {
    render(await DossierPage(props(veteran)));
    expect(screen.getByRole("link", { name: /sua vez/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /baixar 1\.0\.0/i })).toHaveAttribute("href", "/baixar");
  });

  it("answers 404 for a forged or broken code", async () => {
    await expect(DossierPage(props("1-2-3"))).rejects.toThrow();
  });

  it("describes the run for link previews", async () => {
    const metadata = await generateMetadata(props(veteran));
    expect(metadata.title).toBe("Veterano no dia 60");
  });

  it("prerenders a sample run so the route is validated at build time", () => {
    expect(generateStaticParams()).toHaveLength(1);
  });
});
