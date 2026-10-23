import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import { OriginsGame } from "@/components/lore/origins/OriginsGame";
import { origins } from "@/content/origins";

// Letra de quem anotou os dossiês: cadernos, regras e escolhas.
const hand = Caveat({ variable: "--font-caveat", subsets: ["latin"] });

export const metadata: Metadata = {
  title: origins.title,
  description: "Abra os dossiês e jogue como Haven, Rovers, Wardens e Military começaram, antes do seu Dia 1.",
  alternates: { canonical: `/lore/${origins.slug}` },
};

export default function OriginsGamePage() {
  return (
    <div className={hand.variable}>
      <OriginsGame />
    </div>
  );
}
