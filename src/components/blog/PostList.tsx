import Link from "next/link";
import { type Post, readingMinutes } from "@/lib/blog/posts";
import { formatDate } from "@/lib/format";

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return <p className="text-plate/70">Nenhum post por enquanto.</p>;

  return (
    <ul className="grid gap-6">
      {posts.map((post) => (
        <li
          key={post.slug}
          className="reveal rounded border border-rust/40 bg-asphalt p-6 transition hover:border-sunset"
        >
          <p className="text-sm text-plate/50">
            <time dateTime={post.date} className="text-sunset">
              {formatDate(post.date)}
            </time>{" "}
            · {readingMinutes(post.content)} min de leitura
          </p>
          <h2 className="mt-1 font-stencil text-2xl">
            <Link href={`/blog/${post.slug}`} className="text-plate hover:text-sunset">
              {post.title}
            </Link>
          </h2>
          <p className="mt-2 text-plate/75">{post.summary}</p>
        </li>
      ))}
    </ul>
  );
}
