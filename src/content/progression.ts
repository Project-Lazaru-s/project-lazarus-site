export type Stage = {
  from: number;
  label: string;
  threats: string[];
  loot?: string;
};

export const progression: Stage[] = [
  {
    from: 0,
    label: "Dias 0–3",
    threats: ["Poucos walkers, longe de você.", "Os sentidos dos zumbis só ligam no dia 3."],
    loot: "100%",
  },
  {
    from: 3,
    label: "Dias 3–10",
    threats: [
      "Mais zumbis, e em grupos.",
      "Militares e saqueadores à noite.",
      "Runners noturnos a partir do dia 6.",
    ],
    loot: "72% nos locais comuns e 86% nos arriscados, a partir do dia 7",
  },
  {
    from: 10,
    label: "Dia 10",
    threats: ["Primeira horda: pequena, e cada uma é 15% maior que a anterior."],
  },
  {
    from: 12,
    label: "Dias 12–20",
    threats: [
      "Especiais do Undead Revamped na superfície.",
      "Covis do Hollow; caçadores e canibais a partir do dia 13.",
      "Zonas de gás, zumbis militares blindados e quedas de helicóptero.",
      "Runners em dobro a partir do dia 14.",
    ],
    loot: "42% / 62% a partir do dia 15",
  },
  {
    from: 20,
    label: "Dias 20–30",
    threats: ["Até 70 hostis por perto.", "Runners nas hordas.", "Declínio militar e quarentenas."],
  },
  {
    from: 30,
    label: "Dias 30, 45 e 60",
    threats: ["Degraus finais: teto de 80, 90 e 100 hostis.", "Mais runners e mais especiais."],
    loot: "25% / 45% a partir do dia 40",
  },
];
