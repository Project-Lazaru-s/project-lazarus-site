import type { Metadata } from "next";
import { PostList } from "@/components/blog/PostList";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAllPosts } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Bastidores do desenvolvimento do Project Lazarus.",
};

export default function BlogPage() {
  return (
    <>
      <PageHeader title="Blog">
        <p>Bastidores do desenvolvimento: como cada sistema do modpack foi pensado e construído.</p>
      </PageHeader>
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <PostList posts={getAllPosts()} />
      </section>
    </>
  );
}
