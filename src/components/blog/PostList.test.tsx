import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Post } from "@/lib/blog/posts";
import { PostList } from "./PostList";

const post: Post = {
  slug: "1-0-0-chegou",
  title: "1.0.0 chegou",
  date: "2026-10-22",
  summary: "O lançamento do Project Lazarus.",
  draft: false,
  content: "",
};

describe("PostList", () => {
  it("links each post with its date and summary", () => {
    render(<PostList posts={[post]} />);
    expect(screen.getByRole("link", { name: "1.0.0 chegou" })).toHaveAttribute("href", "/blog/1-0-0-chegou");
    expect(screen.getByText("22 de outubro de 2026")).toBeInTheDocument();
    expect(screen.getByText(post.summary)).toBeInTheDocument();
  });

  it("says so when there are no posts yet", () => {
    render(<PostList posts={[]} />);
    expect(screen.getByText(/nenhum post/i)).toBeInTheDocument();
  });
});
