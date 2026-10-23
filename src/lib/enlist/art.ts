import type { SideId } from "./enlist";

/** Ilustração (cena) e emblema de cada lado, gerados para o servidor (não são as facções de NPC). */
export const ART: Record<SideId, { scene: string; emblem: string | null; color: string }> = {
  f873: {
    scene: "/images/servidor/faccao-militar.png",
    emblem: "/images/servidor/emblema-militar.png",
    color: "#7a8450",
  },
  f1041: { scene: "/images/servidor/faccao-bando.png", emblem: "/images/servidor/emblema-bando.png", color: "#b3201c" },
  f1215: {
    scene: "/images/servidor/faccao-milicia.png",
    emblem: "/images/servidor/emblema-milicia.png",
    color: "#4f7aa0",
  },
  solo: { scene: "/images/servidor/lobo-solitario.png", emblem: null, color: "#d9822b" },
};
