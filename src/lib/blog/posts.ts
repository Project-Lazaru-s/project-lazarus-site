import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Post = {
  slug: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  summary: string;
  draft: boolean;
  content: string;
};

// Posts are read at build time; unknown slugs at request time just 404.
export const POSTS_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), "content", "blog");

const SLUG = /^[a-z0-9-]+$/;

function required(slug: string, data: Record<string, unknown>, field: string) {
  const value = data[field];
  if (value === undefined || value === "")
    throw new Error(`Post "${slug}": campo "${field}" obrigatório no frontmatter`);
  return value;
}

export function parsePost(slug: string, raw: string): Post {
  const { data, content } = matter(raw);
  const date = required(slug, data, "date");
  return {
    slug,
    title: String(required(slug, data, "title")),
    // YAML turns 2026-10-22 into a Date at UTC midnight.
    date: date instanceof Date ? date.toISOString().slice(0, 10) : String(date),
    summary: String(required(slug, data, "summary")),
    draft: data.draft === true,
    content: content.replace(/^\n/, ""),
  };
}

export function getAllPosts(dir = POSTS_DIR): Post[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => parsePost(file.slice(0, -3), readFileSync(path.join(dir, file), "utf8")))
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string, dir = POSTS_DIR): Post | undefined {
  if (!SLUG.test(slug)) return undefined;
  const file = path.join(dir, `${slug}.md`);
  if (!existsSync(file)) return undefined;
  const post = parsePost(slug, readFileSync(file, "utf8"));
  return post.draft ? undefined : post;
}

const WORDS_PER_MINUTE = 200;

export function readingMinutes(content: string) {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
