export type ProgressionEvent = { day: number; text: string };

/**
 * O que começa em cada dia, tirado da tabela de progressão do 1.0.0.
 * Quando a tabela só dá um intervalo (ex.: "12–20"), o evento entra no começo dele.
 */
export const progressionEvents: ProgressionEvent[] = [
  { day: 0, text: "Poucos walkers, longe de você." },
  { day: 3, text: "Os sentidos deles ligam: ouvem, farejam sangue e seguem a luz." },
  { day: 3, text: "Mais zumbis, e em grupos." },
  { day: 3, text: "Militares e saqueadores à noite." },
  { day: 6, text: "Runners saem à noite." },
  { day: 7, text: "O saque cai: 72% nos locais comuns, 86% nos arriscados." },
  { day: 10, text: "Primeira horda: pequena, e cada uma vem 15% maior." },
  { day: 12, text: "Especiais do Undead Revamped na superfície." },
  { day: 12, text: "Covis do Hollow." },
  { day: 12, text: "Zonas de gás." },
  { day: 12, text: "Zumbis militares blindados." },
  { day: 12, text: "Quedas de helicóptero." },
  { day: 13, text: "Caçadores e canibais." },
  { day: 14, text: "Runners em dobro." },
  { day: 15, text: "O saque cai de novo: 42% nos comuns, 62% nos arriscados." },
  { day: 20, text: "Até 70 hostis por perto." },
  { day: 20, text: "Runners nas hordas." },
  { day: 20, text: "Declínio militar e quarentenas." },
  { day: 30, text: "Até 80 hostis, mais runners e mais especiais." },
  { day: 40, text: "Saque no fundo: 25% nos comuns, 45% nos arriscados." },
  { day: 45, text: "Até 90 hostis." },
  { day: 60, text: "Até 100 hostis. O último degrau." },
];

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
