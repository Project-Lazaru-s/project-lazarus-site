import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ART } from "@/lib/enlist/art";
import { decodeCard, encodeCard, SIDES } from "@/lib/enlist/enlist";

// Um cartão de exemplo para o build validar a rota; os outros são gerados sob demanda.
export function generateStaticParams() {
  return [{ code: encodeCard({ number: 1, nick: "Lazarus", side: "f873" }) }];
}

export async function generateMetadata({ params }: PageProps<"/servidor/ficha/[code]">): Promise<Metadata> {
  const card = decodeCard((await params).code);
  if (!card) return {};
  const side = SIDES.find((s) => s.id === card.side)!;
  return {
    title: `${card.nick} se alistou: ${side.name}`,
    description: `Ficha nº ${card.number} do servidor de guerra do Project Lazarus. Escolha o seu lado.`,
  };
}

export default async function CardPage({ params }: PageProps<"/servidor/ficha/[code]">) {
  const card = decodeCard((await params).code);
  if (!card) notFound();
  const side = SIDES.find((s) => s.id === card.side)!;

  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="font-mono text-sm tracking-[0.3em] text-sunset uppercase">Servidor de guerra</p>
        <h1 className="mt-2 font-stencil text-5xl text-plate">{card.nick} respondeu ao chamado.</h1>
        <p className="mt-4 text-plate/75">
          {side.freq ? `A frequência ${side.freq.toFixed(1)} está recrutando. ` : "Mais um lobo solitário na estrada. "}
          O servidor de guerra do Project Lazarus coloca três facções de jogadores numa cidade em ruínas, com a horda no
          meio. Quem se alista agora reserva o nick.
        </p>
        <Link
          href="/servidor"
          className="mt-8 inline-block rounded bg-lazarus px-6 py-3 font-semibold text-plate hover:bg-lazarus/85"
        >
          Alistar-se também
        </Link>
      </div>
      <div className="lore-paper relative rounded-sm p-8 text-asphalt-deep shadow-2xl">
        <p className="font-mono text-xs tracking-[0.2em] uppercase">Ficha nº {card.number}</p>
        <p className="mt-2 font-stencil text-4xl">{card.nick}</p>
        <p className="mt-1">Lado: {side.name}</p>
        <p className="mt-4 text-sm text-asphalt-deep/75">{side.line}</p>
        <Image
          src={ART[side.id].emblem ?? ART[side.id].scene}
          alt=""
          width={160}
          height={160}
          className={`mt-6 size-32 ${ART[side.id].emblem ? "" : "rounded-full object-cover"}`}
        />
        <p className="absolute top-6 right-6 rotate-[-8deg] rounded-sm border-4 border-lazarus px-3 py-1 font-stencil text-2xl text-lazarus">
          ALISTADO
        </p>
      </div>
    </section>
  );
}
