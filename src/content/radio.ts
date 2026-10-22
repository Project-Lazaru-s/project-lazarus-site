// Transmissões interceptadas, no formato dos eventos do Lazarus Events.
// As coordenadas são ilustrativas, como as aproximadas que o rádio dá no jogo.

export type RadioChannel = { frequency: string; message: string; href: string };

export const radioChannels: RadioChannel[] = [
  {
    frequency: "88.1",
    message: "[RADIO] kssh... três sobreviventes presos no telhado do hospital... perto de X 410, Z -1280... kssh...",
    href: "/modpack#eventos",
  },
  {
    frequency: "93.7",
    message: "[RADIO] kssh... fumaça no céu. Um helicóptero caiu ao norte... kssh... tem saque, e tem barulho...",
    href: "/modpack#eventos",
  },
  {
    frequency: "101.5",
    message: "[RADIO] kssh... precisamos de ajuda no posto... venha sozinho... kssh... (o sinal parece limpo demais)",
    href: "/modpack#eventos",
  },
  {
    frequency: "107.9",
    message: "[RADIO] kssh... o metrô está tomado de gás. Ninguém entra sem máscara e filtro... kssh...",
    href: "/modpack#eventos",
  },
];

/** Quanto do texto já apareceu depois de `elapsedMs`, digitando `charsPerSecond` letras por segundo. */
export function typed(text: string, elapsedMs: number, charsPerSecond: number) {
  return text.slice(0, Math.floor((elapsedMs / 1000) * charsPerSecond));
}

export type RadioInterrupt = { day: number; message: string; target: number };

/** Transmissões que cortam a página quando o sobrevivente chega a certos dias (alvo: seção da landing). */
export const radioInterrupts: RadioInterrupt[] = [
  {
    day: 4,
    message: "[RADIO] kssh... metade do grupo bebeu do rio e passou mal... só bebam lacrada... kssh...",
    target: 5,
  },
  {
    day: 7,
    message: "[RADIO] kssh... achamos um baú trancado no porão da rua 12... alguém tem gazua?... kssh...",
    target: 7,
  },
  {
    day: 10,
    message: "[RADIO] kssh... horda vindo pelo norte... segurem a barricada, mirem na cabeça... kssh...",
    target: 10,
  },
  {
    day: 15,
    message: "[RADIO] kssh... a farmácia da esquina ainda tem armários fechados... corram... kssh...",
    target: 15,
  },
  {
    day: 20,
    message: "[RADIO] kssh... os Rovers estão trocando antibiótico... não provoquem... kssh...",
    target: 20,
  },
];

export function interruptFor(day: number) {
  return radioInterrupts.findLast((r) => r.day <= day) ?? null;
}
