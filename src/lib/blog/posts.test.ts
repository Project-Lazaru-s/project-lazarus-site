import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAllPosts, getPost, parsePost } from "./posts";

const post = (frontmatter: string, body = "Corpo do post.") => `---\n${frontmatter}\n---\n${body}\n`;

describe("parsePost", () => {
  it("reads frontmatter and content", () => {
    const parsed = parsePost(
      "lancamento",
      post('title: "1.0.0 chegou"\ndate: 2026-10-22\nsummary: Resumo curto.', "## Olá"),
    );
    expect(parsed).toEqual({
      slug: "lancamento",
      title: "1.0.0 chegou",
      date: "2026-10-22",
      summary: "Resumo curto.",
      draft: false,
      content: "## Olá\n",
    });
  });

  it("keeps drafts flagged", () => {
    expect(parsePost("x", post("title: T\ndate: 2026-10-22\nsummary: S\ndraft: true")).draft).toBe(true);
  });

  it("fails loudly when a required field is missing", () => {
    expect(() => parsePost("sem-data", post("title: T\nsummary: S"))).toThrow(/sem-data.*date/);
    expect(() => parsePost("sem-titulo", post("date: 2026-10-22\nsummary: S"))).toThrow(/sem-titulo.*title/);
  });
});

describe("posts on disk", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "lazarus-posts-"));
    writeFileSync(path.join(dir, "antigo.md"), post("title: Antigo\ndate: 2026-10-15\nsummary: A"));
    writeFileSync(path.join(dir, "novo.md"), post("title: Novo\ndate: 2026-10-22\nsummary: N"));
    writeFileSync(path.join(dir, "rascunho.md"), post("title: R\ndate: 2026-10-23\nsummary: R\ndraft: true"));
    writeFileSync(path.join(dir, "notas.txt"), "não é post");
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("lists published posts, newest first", () => {
    expect(getAllPosts(dir).map((p) => p.slug)).toEqual(["novo", "antigo"]);
  });

  it("finds a post by slug", () => {
    expect(getPost("antigo", dir)?.title).toBe("Antigo");
  });

  it("does not expose drafts or unknown slugs", () => {
    expect(getPost("rascunho", dir)).toBeUndefined();
    expect(getPost("nao-existe", dir)).toBeUndefined();
  });

  it("rejects slugs that try to leave the posts folder", () => {
    expect(getPost("../segredo", dir)).toBeUndefined();
  });
});
