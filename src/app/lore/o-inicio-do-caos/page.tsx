import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import { StoryGame } from "@/components/lore/game/StoryGame";
import { inicioDoCaos } from "@/content/lore";

// Letra da enfermeira: anotações do caderno, pichações e escolhas.
const hand = Caveat({ variable: "--font-caveat", subsets: ["latin"] });

export const metadata: Metadata = {
  title: inicioDoCaos.title,
  description: "Jogue a lore do Project Lazarus em 5 atos e descubra o que aconteceu com a cidade antes do seu Dia 1.",
  alternates: { canonical: "/lore/o-inicio-do-caos" },
};

export default function StoryGamePage() {
  return (
    <div className={hand.variable}>
      <StoryGame />
    </div>
  );
}
