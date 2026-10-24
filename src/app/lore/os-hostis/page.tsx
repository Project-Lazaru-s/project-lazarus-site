import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import { HostisGame } from "@/components/lore/hostis/HostisGame";
import { hostis } from "@/content/hostis";

// Letra de quem deixou os alertas: avisos, contas e casos.
const hand = Caveat({ variable: "--font-caveat", subsets: ["latin"] });

export const metadata: Metadata = {
  title: hostis.title,
  description: "Investigue como Desertores, The Hollow e as oito gangues cruzaram a linha, antes do seu Dia 1.",
  alternates: { canonical: `/lore/${hostis.slug}` },
};

export default function HostisGamePage() {
  return (
    <div className={hand.variable}>
      <HostisGame />
    </div>
  );
}
