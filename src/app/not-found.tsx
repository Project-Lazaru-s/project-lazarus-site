import Link from "next/link";
import { ChaseGame } from "@/components/games/ChaseGame";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <p className="font-stencil text-7xl text-lazarus">404</p>
      <h1 className="mt-4 font-stencil text-3xl text-plate">Página não encontrada</h1>
      <p className="mt-2 text-plate/70">Não sobrou nada aqui. Nem saque.</p>
      <Link href="/" className="mt-8 inline-block rounded bg-lazarus px-5 py-2 font-semibold text-plate hover:bg-lazarus/85">
        Voltar ao início
      </Link>
      <ChaseGame />
    </section>
  );
}
