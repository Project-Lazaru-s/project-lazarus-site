import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prose } from "@/components/ui/Prose";
import { getAllPosts, getPost } from "@/lib/blog/posts";
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
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/blog" className="text-sm text-plate/60 hover:text-plate">
        ← Blog
      </Link>
      <header className="mt-6 mb-8">
        <time dateTime={post.date} className="text-sm text-sunset">
          {formatDate(post.date)}
        </time>
        <h1 className="mt-1 font-stencil text-4xl text-plate sm:text-5xl">{post.title}</h1>
      </header>
      <Prose markdown={post.content} />
    </article>
  );
}
