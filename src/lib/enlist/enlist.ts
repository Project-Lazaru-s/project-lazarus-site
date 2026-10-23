// Ficha de alistamento do servidor de guerra (PvP de facções). Validação pura: roda no navegador
// para responder na hora e de novo na Server Action, que é a que vale.

/** As três facções de jogadores (ainda sem nome, conhecidas pela frequência) e quem joga sozinho. */
export const SIDES = [
  {
    id: "f873",
    freq: 87.3,
    name: "87.3 · Ex-militares",
    line: "Hierarquia, checkpoints e poder de fogo. Território se toma em formação.",
    call: "Aqui é o posto 87.3. A farda acabou, a disciplina não. Temos rádio, munição contada e uma linha a segurar. Procuramos quem obedeça ordem e não recue.",
  },
  {
    id: "f1041",
    freq: 104.1,
    name: "104.1 · Bando",
    line: "Saque, emboscada e intimidação. O que é dos outros é de quem pegar primeiro.",
    call: "Cento e quatro ponto um. Aqui ninguém pede licença. Tem comboio pra emboscar, depósito pra limpar e lugar no bando pra quem não tem medo de sujar a mão.",
  },
  {
    id: "f1215",
    freq: 121.5,
    name: "121.5 · Milícia civil",
    line: "Bairro murado, plantão e mutirão. Ninguém fica para trás.",
    call: "Cento e vinte e um e meio, falando do bairro. A gente era vizinho, professor, mecânico. Hoje é muro, horta e plantão. Se você quer proteger alguém, vem pra cá.",
  },
  {
    id: "solo",
    freq: null,
    name: "Lobo solitário",
    line: "Sem frequência. Sobrevive por conta própria, troca com quem quiser e atira em quem precisar.",
    call: "Nenhum chamado. Só a estrada, a mochila e a horda. Você não deve nada a ninguém.",
  },
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

  if (!NICK.test(nick)) errors.nick = "Use o nick do Minecraft Java: 3 a 16 letras, números ou _.";
  if (!EMAIL.test(email)) errors.email = "Informe um e-mail válido para o aviso de lançamento.";
  if (input.whatsapp.trim() && !whatsapp) errors.whatsapp = "Número com DDD, por exemplo (11) 98765-4321.";
  if (discord && !DISCORD.test(discord)) errors.discord = "Nome de usuário do Discord, de 2 a 32 caracteres.";
  if (!has(SIDES, input.side)) errors.side = "Sintonize uma frequência ou siga como lobo solitário.";
  if (!has(EXPERIENCE, input.experience)) errors.experience = "Escolha a sua experiência.";
  if (!has(REGIONS, input.region)) errors.region = "Escolha a sua região.";
  if (!has(PLAYTIMES, input.playtime)) errors.playtime = "Escolha quando costuma jogar.";
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
