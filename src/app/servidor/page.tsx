import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { EnlistForm } from "@/components/enlist/EnlistForm";
import { RecruitCount } from "@/components/enlist/RecruitCount";

export const metadata: Metadata = {
  title: "Servidor de guerra",
  description:
    "Três facções de jogadores, uma cidade em ruínas e a horda no meio. Aliste-se no servidor do Project Lazarus e reserve o seu nick.",
};

const posters = [
  {
    title: "Território",
    text: "A cidade é dividida entre três facções de jogadores. Setores, postos e estradas mudam de dono a cada noite.",
    image: "/images/servidor/territorio.png",
  },
  {
    title: "Cercos",
    text: "Muralha de contêiner, torre de vigia, ataque com hora marcada. Defenda a sua base ou derrube a dos outros.",
    image: "/images/servidor/cerco.png",
  },
];

const promises = [
  ["A horda no meio", "Os mortos atacam todos os lados. Todo tiroteio faz barulho, e barulho chama a horda."],
  [
    "Sobreviver também conta",
    "Sede, fome, infecção e saque escasso continuam valendo. Dá para jogar sozinho, longe da guerra.",
  ],
  [
    "Nomes em aberto",
    "As três facções ainda não têm nome. Quem se alistar primeiro vai decidir como cada uma se chama.",
  ],
  ["Nick reservado", "Quem se alista agora garante o nick no servidor antes da abertura."],
];

export default function ServerPage() {
  return (
    <>
      <header className="relative isolate overflow-hidden">
        <Image
          src="/images/servidor/radio.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="lore-kenburns -z-10 object-cover opacity-80"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-asphalt-deep/90 via-asphalt-deep/60 to-asphalt-deep/10" />
        <div className="mx-auto max-w-6xl px-4 pt-24 pb-20 sm:pt-32">
          <p className="lore-broadcast font-mono text-sm tracking-[0.3em] text-radio uppercase">
            ● Transmissão interceptada
          </p>
          <h1 className="mt-4 max-w-3xl font-stencil text-5xl leading-tight text-plate sm:text-6xl">
            Se você está ouvindo isto, a cidade ainda não acabou.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-plate/85">
            Três grupos estão se armando e todos estão recrutando. O servidor de guerra do Project Lazarus junta
            jogadores de verdade numa cidade em ruínas, com a horda no meio do fogo cruzado.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#alistamento"
              className="rounded bg-lazarus px-6 py-3 font-semibold text-plate hover:bg-lazarus/85"
            >
              Sintonizar o rádio
            </a>
            <span className="font-mono text-sm text-plate/70">Alistamento aberto · nick reservado</span>
          </div>
        </div>
      </header>

      <section aria-label="O que é o servidor" className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {posters.map((p) => (
            <article key={p.title} className="reveal overflow-hidden rounded-sm border border-rust/40 bg-asphalt">
              <Image src={p.image} alt="" width={1672} height={941} sizes="(min-width: 768px) 50vw, 100vw" />
              <div className="p-5">
                <h2 className="font-stencil text-3xl text-lazarus">{p.title}</h2>
                <p className="mt-2 text-plate/80">{p.text}</p>
              </div>
            </article>
          ))}
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map(([title, text]) => (
            <li key={title} className="reveal border-l-2 border-lazarus pl-4">
              <p className="font-stencil text-xl text-plate">{title}</p>
              <p className="text-sm text-plate/75">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="alistamento"
        aria-labelledby="alistamento-titulo"
        className="scroll-mt-20 border-t border-rust/40 bg-asphalt/40"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <h2 id="alistamento-titulo" className="font-stencil text-4xl text-plate">
              Escolha a sua frequência
            </h2>
            <p className="text-plate/80">
              Gire o dial até a estática limpar. Cada facção transmite numa frequência: ex-militares, bando e milícia
              civil. Ouça o chamado e responda ao que combina com você, ou siga sozinho.
            </p>
            <Suspense>
              <RecruitCount />
            </Suspense>
          </div>
          <EnlistForm />
        </div>
      </section>
    </>
  );
}
