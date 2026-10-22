import { renderMarkdown } from "@/lib/markdown";

export function Prose({ markdown }: { markdown: string }) {
  return <div className="prose-lazarus" dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }} />;
}
