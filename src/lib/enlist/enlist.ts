// Ficha de alistamento do servidor de guerra (PvP de facções). Validação pura: roda no navegador
// para responder na hora e de novo na Server Action, que é a que vale.

export const SIDES = [
  { id: "haven", name: "Haven", line: "Defender o refúgio e tratar os feridos. Guerra só quando atacam a sua casa." },
  {
    id: "rovers",
    name: "Rovers",
    line: "Estrada aberta, comércio e emboscadas. Quem controla as rotas controla o mapa.",
  },
  { id: "wardens", name: "Wardens", line: "Muralha, patrulha e revista. Ninguém passa sem a sua permissão." },
  { id: "fundar", name: "Fundar a minha", line: "Você e o seu grupo, com nome, bandeira e território próprios." },
  { id: "solo", name: "Lobo solitário", line: "Sem bandeira. Troca com quem quiser, atira em quem precisar." },
] as const;

export const EXPERIENCE = [
  { id: "novato", label: "Novato em PvP" },
  { id: "ja-joguei", label: "Já joguei servidores PvP" },
  { id: "veterano", label: "Veterano de guerra de facções" },
] as const;

export const REGIONS = [
  { id: "sul", label: "Sul" },
  { id: "sudeste", label: "Sudeste" },
  { id: "centro-oeste", label: "Centro-Oeste" },
  { id: "nordeste", label: "Nordeste" },
  { id: "norte", label: "Norte" },
  { id: "exterior", label: "Fora do Brasil" },
] as const;

export const PLAYTIMES = [
  { id: "manha", label: "Manhã" },
  { id: "tarde", label: "Tarde" },
  { id: "noite", label: "Noite" },
  { id: "madrugada", label: "Madrugada" },
] as const;

export type SideId = (typeof SIDES)[number]["id"];

export type EnlistInput = {
  nick: string;
  email: string;
  whatsapp: string;
  discord: string;
  side: string;
  experience: string;
  region: string;
  playtime: string;
  groupSize: string;
  consent: boolean;
  /** Campo escondido: só robôs preenchem. */
  website: string;
};

export type Recruit = {
  nick: string;
  email: string;
  whatsapp: string | null;
  discord: string | null;
  side: SideId;
  experience: string;
  region: string;
  playtime: string;
  groupSize: number | null;
};

export type Field = keyof Omit<EnlistInput, "website">;
export type Validation =
  { ok: true; data: Recruit } | { ok: false; bot?: true; errors: Partial<Record<Field, string>> };

const NICK = /^[A-Za-z0-9_]{3,16}$/; // formato de nome do Minecraft Java
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DISCORD = /^[a-z0-9_.]{2,32}$/; // nome de usuário novo do Discord
const has = (list: readonly { id: string }[], id: string) => list.some((item) => item.id === id);

/** WhatsApp em formato internacional (+DDI…). Número local de 10 ou 11 dígitos ganha o +55. */
export function normalizeWhatsapp(raw: string): string | null {
  const international = raw.trim().startsWith("+");
  const digits = raw.replace(/\D/g, "");
  if (!international && (digits.length === 10 || digits.length === 11)) return `+55${digits}`;
  if (international && digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return null;
}

export function validate(input: EnlistInput): Validation {
  if (input.website.trim()) return { ok: false, bot: true, errors: {} };

  const errors: Partial<Record<Field, string>> = {};
  const nick = input.nick.trim();
  const email = input.email.trim().toLowerCase();
  const discord = input.discord.trim().toLowerCase();
  const whatsapp = input.whatsapp.trim() ? normalizeWhatsapp(input.whatsapp) : null;
  const groupSize = Number(input.groupSize);

  if (!NICK.test(nick)) errors.nick = "Use o nick do Minecraft Java: 3 a 16 letras, números ou _.";
  if (!EMAIL.test(email)) errors.email = "Informe um e-mail válido para o aviso de lançamento.";
  if (input.whatsapp.trim() && !whatsapp) errors.whatsapp = "Número com DDD, por exemplo (11) 98765-4321.";
  if (discord && !DISCORD.test(discord)) errors.discord = "Nome de usuário do Discord, de 2 a 32 caracteres.";
  if (!has(SIDES, input.side)) errors.side = "Escolha um lado da guerra.";
  if (!has(EXPERIENCE, input.experience)) errors.experience = "Escolha a sua experiência.";
  if (!has(REGIONS, input.region)) errors.region = "Escolha a sua região.";
  if (!has(PLAYTIMES, input.playtime)) errors.playtime = "Escolha quando costuma jogar.";
  if (input.side === "fundar" && !(Number.isInteger(groupSize) && groupSize >= 2 && groupSize <= 50))
    errors.groupSize = "Quantas pessoas no seu grupo? De 2 a 50.";
  if (!input.consent) errors.consent = "Precisamos do seu aceite para guardar a ficha.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: {
      nick,
      email,
      whatsapp,
      discord: discord || null,
      side: input.side as SideId,
      experience: input.experience,
      region: input.region,
      playtime: input.playtime,
      groupSize: input.side === "fundar" ? groupSize : null,
    },
  };
}

// ---------- Cartão de alistamento compartilhável ----------
// O código vai na URL só com número, nick e lado (nada de contato), sem consultar o banco.

export type Card = { number: number; nick: string; side: SideId };

export function encodeCard(card: Card) {
  return Buffer.from(JSON.stringify([card.number, card.nick, card.side])).toString("base64url");
}

export function decodeCard(code: string): Card | null {
  try {
    const value: unknown = JSON.parse(Buffer.from(code, "base64url").toString("utf8"));
    if (!Array.isArray(value) || value.length !== 3) return null;
    const [number, nick, side] = value;
    if (!Number.isInteger(number) || number < 1) return null;
    if (typeof nick !== "string" || !NICK.test(nick)) return null;
    if (typeof side !== "string" || !has(SIDES, side)) return null;
    return { number, nick, side: side as SideId };
  } catch {
    return null;
  }
}
