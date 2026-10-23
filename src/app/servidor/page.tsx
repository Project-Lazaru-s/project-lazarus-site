import type { Metadata } from "next";
import { Suspense } from "react";
import { EnlistForm } from "@/components/enlist/EnlistForm";
import { RecruitCount } from "@/components/enlist/RecruitCount";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Servidor de guerra",
  description: "Aliste-se no servidor multiplayer do Project Lazarus: facções de jogadores em guerra por território.",
};

const plans = [
  ["Facções de jogadores", "Entre em Haven, Rovers ou Wardens, funde a sua com o seu grupo ou jogue sozinho."],
  ["Território e estradas", "Bases, postos e rotas de comércio em disputa. Quem segura o mapa dita as regras."],
  ["A horda não para", "Os mortos continuam lá fora, para todos os lados. Toda guerra tem um terceiro inimigo."],
];

export default function ServerPage() {
  return (
    <>
      <PageHeader title="Servidor de guerra">
        <p>
          O Project Lazarus vai ganhar um servidor multiplayer onde as facções são de jogadores, e a guerra também. O
          alistamento está aberto: quem preenche a ficha recebe o aviso de lançamento e entra entre os primeiros.
        </p>
      </PageHeader>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-8">
          <ul className="space-y-4">
            {plans.map(([title, text]) => (
              <li key={title} className="border-l-2 border-lazarus pl-4">
                <p className="font-stencil text-xl text-plate">{title}</p>
                <p className="text-plate/75">{text}</p>
              </li>
            ))}
          </ul>
          <Suspense>
            <RecruitCount />
          </Suspense>
        </div>
        <EnlistForm />
      </div>
    </>
  );
}
