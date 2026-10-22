import Image from "next/image";
import Link from "next/link";
import { highlights, slogans } from "@/content/home";
import { site } from "@/content/site";

export default function HomePage() {
  return (
    <>
      <section aria-label="Apresentação" className="relative isolate overflow-hidden">
        <Image
          src="/images/banners/modpack.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[30%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-asphalt-deep via-asphalt-deep/85 to-asphalt-deep/20" />
        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-36">
          <p className="text-sm tracking-[0.3em] text-sunset uppercase">
            Minecraft 1.20.1 · Forge · Versão {site.version}
          </p>
          <h1 className="mt-4 font-stencil text-6xl leading-none text-plate sm:text-8xl">
            Project <span className="block text-lazarus">Lazarus</span>
          </h1>
          <p className="mt-6 max-w-xl text-2xl text-plate">{site.tagline}</p>
          <p className="mt-3 max-w-xl text-plate/75">{site.description}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/baixar" className="rounded bg-lazarus px-6 py-3 font-semibold text-plate hover:bg-lazarus/85">
              Baixar {site.version}
            </Link>
            <Link
              href="/modpack"
              className="rounded border border-plate/40 px-6 py-3 text-plate hover:border-sunset hover:text-sunset"
            >
              Conheça o modpack
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="destaques" className="mx-auto max-w-6xl px-4 py-20">
        <h2 id="destaques" className="font-stencil text-4xl text-plate">
          Como é sobreviver
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((highlight) => (
            <li key={highlight.title}>
              <Link
                href={highlight.href}
                className="block h-full rounded border border-rust/40 bg-asphalt p-6 transition hover:border-sunset"
              >
                <h3 className="font-stencil text-2xl text-lazarus">{highlight.title}</h3>
                <p className="mt-2 text-plate/75">{highlight.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-rust/40 bg-asphalt">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {slogans.map((slogan) => (
              <p key={slogan} className="font-stencil text-2xl text-plate sm:text-3xl">
                {slogan}
              </p>
            ))}
          </div>
          <Link
            href="/baixar"
            className="self-start rounded bg-lazarus px-6 py-3 font-semibold text-plate hover:bg-lazarus/85 sm:self-auto"
          >
            Como instalar
          </Link>
        </div>
      </section>
    </>
  );
}
