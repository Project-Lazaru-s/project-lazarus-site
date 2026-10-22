import type { Item } from "@/lib/survival/survival";

export const items: Record<Item, { label: string; icon: string }> = {
  antibiotic: { label: "Antibiótico", icon: "/images/game/item-antibiotic.png" },
  painkiller: { label: "Analgésico", icon: "/images/game/item-painkiller.png" },
  bandage: { label: "Bandagem", icon: "/images/game/item-bandage.png" },
  water: { label: "Água engarrafada", icon: "/images/game/water-bottle.png" },
  ammo: { label: "Munição", icon: "/images/game/item-ammo.png" },
  food: { label: "Comida enlatada", icon: "/images/game/item-food.png" },
};
