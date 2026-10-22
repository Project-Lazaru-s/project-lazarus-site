import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { links } from "@/content/site";
import DownloadPage from "./page";

const getReleases = vi.hoisted(() => vi.fn());
vi.mock("@/lib/releases/getReleases", () => ({ getReleases }));

const renderPage = async () => render(await DownloadPage());

describe("/baixar", () => {
  beforeEach(() => {
    localStorage.clear();
    getReleases.mockResolvedValue([
      {
        asset: {
          name: "Project-Lazarus-1.0.0.zip",
          size: 13_031_141,
          url: "#",
        },
      },
    ]);
  });

  it("downloads the import zip from the latest GitHub release", async () => {
    await renderPage();
    expect(
      screen.getByRole("link", {
        name: /baixar project-lazarus-1\.0\.0\.zip/i,
      }),
    ).toHaveAttribute("href", links.download);
  });

  it("shows the real zip size from the release", async () => {
    await renderPage();
    expect(screen.getByRole("link", { name: /baixar project-lazarus/i })).toHaveTextContent("13,0 MB");
  });

  it("still offers the download when GitHub is unreachable", async () => {
    getReleases.mockResolvedValue([]);
    await renderPage();
    expect(screen.getByRole("link", { name: /baixar project-lazarus/i })).not.toHaveTextContent("MB");
  });

  it("turns the CurseForge import into a checklist", async () => {
    await renderPage();
    expect(screen.getByText(/create custom profile → import/i)).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  });

  it("covers manual install and dedicated servers", async () => {
    await renderPage();
    expect(screen.getByRole("heading", { name: /instalação manual/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /servidor/i })).toBeInTheDocument();
    expect(screen.getByText("level-type=cityworld:apocalypse")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copiar view-distance=8" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "MODS.md" })).toHaveAttribute("href", links.modsList);
  });
});
