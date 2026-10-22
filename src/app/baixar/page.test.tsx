import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { links } from "@/content/site";
import DownloadPage from "./page";

describe("/baixar", () => {
  it("downloads the import zip from the latest GitHub release", () => {
    render(<DownloadPage />);
    expect(screen.getByRole("link", { name: /baixar project-lazarus-1\.0\.0\.zip/i })).toHaveAttribute(
      "href",
      links.download,
    );
  });

  it("explains the CurseForge import", () => {
    render(<DownloadPage />);
    expect(screen.getByText(/create custom profile → import/i)).toBeInTheDocument();
  });

  it("covers manual install and dedicated servers", () => {
    render(<DownloadPage />);
    expect(screen.getByRole("heading", { name: /instalação manual/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /servidor/i })).toBeInTheDocument();
    expect(screen.getByText("level-type=cityworld:apocalypse")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "MODS.md" })).toHaveAttribute("href", links.modsList);
  });
});
