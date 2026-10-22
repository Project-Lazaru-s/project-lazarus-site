import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("renders GitHub-flavored markdown to HTML", () => {
    const html = renderMarkdown("## Título\n\n- **um**\n- [link](https://example.com)");
    expect(html).toContain("<h2>Título</h2>");
    expect(html).toContain("<strong>um</strong>");
    expect(html).toContain('<a href="https://example.com">link</a>');
  });
});
