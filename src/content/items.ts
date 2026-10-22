import type { Item } from "@/lib/survival/survival";

export const items: Record<Item, { label: string; icon: string }> = {
  antibiotic: { label: "Antibiótico", icon: "/images/game/item-antibiotic.png" },
  painkiller: { label: "Analgésico", icon: "/images/game/item-painkiller.png" },
  bandage: { label: "Bandagem", icon: "/images/game/item-bandage.png" },
  water: { label: "Água engarrafada", icon: "/images/game/water-bottle.png" },
};
