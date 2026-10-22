import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prose } from "@/components/ui/Prose";
import { getAllPosts, getPost, readingMinutes } from "@/lib/blog/posts";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return getAllPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  return post ? { title: post.title, description: post.summary } : {};
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  return (
    <>
      {/* Barra de stamina que esvazia conforme a leitura avança (CSS puro, scroll-driven). */}
      <div aria-hidden className="read-progress fixed inset-x-0 top-0 z-40 h-1" />
      <article className="mx-auto max-w-6xl px-4 py-12 *:max-w-3xl">
        <Link href="/blog" className="text-sm text-plate/60 hover:text-plate">
          ← Blog
        </Link>
        <header className="mt-6 mb-8">
          <p className="text-sm text-plate/50">
            <time dateTime={post.date} className="text-sunset">
              {formatDate(post.date)}
            </time>{" "}
            · {readingMinutes(post.content)} min de leitura
          </p>
          <h1 className="mt-1 font-stencil text-4xl text-plate sm:text-5xl">{post.title}</h1>
        </header>
        <Prose markdown={post.content} />
      </article>
    </>
  );
}
