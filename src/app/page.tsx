import { site } from "@/content/site";

// Placeholder até o ciclo da página inicial.
export default function Home() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <h1 className="font-stencil text-5xl text-plate">{site.name}</h1>
      <p className="mt-4 text-sunset">{site.tagline}</p>
    </section>
  );
}
