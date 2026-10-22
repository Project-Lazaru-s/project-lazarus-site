import { marked } from "marked";

// ponytail: no sanitizer, every source is first-party (repo posts, our own GitHub releases); add one if user content ever lands here
export function renderMarkdown(markdown: string) {
  return marked.parse(markdown, { async: false, gfm: true });
}
