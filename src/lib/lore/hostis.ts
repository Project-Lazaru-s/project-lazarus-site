import { hostileDossiers, patrols, SHELTER, STATIC_DIAL, staticStations } from "@/content/hostis";
import { makeArchive } from "./archive";

// "Os Hostis" como jogo: o mesmo motor de dossiês do Arquivo 02, aberto a partir de um quadro de alertas.

export const archive = makeArchive(hostileDossiers, "lazarus:lore:os-hostis");

/** Desertores, parte III: o grupo de farda é uma patrulha de verdade ou desertores? */
export const patrolVerdict = (id: (typeof patrols)[number]["id"], answer: "military" | "desertores") =>
  patrols.find((p) => p.id === id)!.answer === answer;

/** The Hollow, parte I: um dia de porções. Inteira gasta uma por pessoa; meia, o mínimo que ainda dá para dividir. */
export function rationDay(stock: number, size: "inteira" | "meia") {
  const need = size === "inteira" ? SHELTER.people : SHELTER.half;
  return need > stock ? { stock, closes: false } : { stock: stock - need, closes: true };
}

/** Static: qual estação o dial pega e com que força (0 a 1). */
export function tuneStatic(freq: number) {
  const best = staticStations
    .map((s) => ({ station: s, strength: Math.max(0, 1 - Math.abs(freq - s.freq) / STATIC_DIAL.width) }))
    .sort((a, b) => b.strength - a.strength)[0];
  return { ...best, locked: best.strength >= 0.8 };
}
