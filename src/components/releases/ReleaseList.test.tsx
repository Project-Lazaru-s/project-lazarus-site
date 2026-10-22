import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { links } from "@/content/site";
import type { Release } from "@/lib/releases/releases";
import { ReleaseList } from "./ReleaseList";

const release: Release = {
  tag: "v1.0.0",
  name: "Project Lazarus 1.0.0",
  publishedAt: "2026-10-22T06:16:35Z",
  url: "https://github.com/Project-Lazaru-s/project-lazarus-modpack/releases/tag/v1.0.0",
  body: "## O que tem\n\n- **Furtividade**",
  asset: {
    name: "Project-Lazarus-1.0.0.zip",
    size: 13_031_141,
    url: "https://example.com/zip",
  },
};

describe("ReleaseList", () => {
  it("renders each release with date, notes and download", () => {
    render(<ReleaseList releases={[release]} />);
    expect(screen.getByRole("heading", { level: 2, name: "Project Lazarus 1.0.0" })).toBeInTheDocument();
    expect(screen.getByText("22 de outubro de 2026")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "O que tem" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /Project-Lazarus-1\.0\.0\.zip.*13,0 MB/,
      }),
    ).toHaveAttribute("href", "https://example.com/zip");
    expect(screen.getByRole("link", { name: /ver no github/i })).toHaveAttribute("href", release.url);
  });

  it("reads like a radio log, flagging only the newest transmission", () => {
    const older = {
      ...release,
      tag: "v0.9.0",
      name: "Project Lazarus 0.9.0",
      publishedAt: "2026-10-01T00:00:00Z",
    };
    render(<ReleaseList releases={[release, older]} />);
    expect(screen.getByText(/kssh/i)).toBeInTheDocument();
    expect(screen.getAllByText("Novo")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Project Lazarus 1.0.0" }).closest("article")).toHaveTextContent("Novo");
  });

  it("points to GitHub when no release could be loaded", () => {
    render(<ReleaseList releases={[]} />);
    expect(screen.getByText(/não foi possível carregar/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /releases no github/i })).toHaveAttribute(
      "href",
      `${links.repository}/releases`,
    );
  });
});
