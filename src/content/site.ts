const repo = "https://github.com/Project-Lazaru-s/project-lazarus-modpack";

export const site = {
  name: "Project Lazarus",
  version: "1.0.0",
  releaseDate: "2026-10-22",
  tagline: "A cidade caiu. Você ainda não.",
  description:
    "Modpack de sobrevivência num apocalipse zumbi para Minecraft Java 1.20.1 (Forge). Coma, beba água limpa, se esconda, negocie com facções e evolua habilidades. Cada dia é mais difícil que o anterior.",
} as const;

export const authors = [
  { name: "KaiD3v", role: "Co-autor", url: "https://kaidev.com.br" },
  { name: "FSantiago75", role: "Co-autor", url: "https://github.com/FSantiago75" },
] as const;

export const links = {
  organization: "https://github.com/Project-Lazaru-s",
  repository: repo,
  release: `${repo}/releases/tag/v${site.version}`,
  download: `${repo}/releases/latest`,
  modsList: `${repo}/blob/main/MODS.md`,
  issues: `${repo}/issues`,
  releasesApi: "https://api.github.com/repos/Project-Lazaru-s/project-lazarus-modpack/releases",
} as const;

export const requirements = [
  { label: "Minecraft", value: "Java 1.20.1" },
  { label: "Loader", value: "Forge 47.4.10" },
  { label: "Java", value: "17" },
  { label: "RAM", value: "8 GB (mínimo 6 GB)" },
  { label: "Mods", value: "109 do CurseForge + 8 Lazarus" },
  { label: "Extras", value: "4 resource packs, 3 shaders" },
  { label: "Modos", value: "Singleplayer e servidor" },
  { label: "Voz", value: "Simple Voice Chat" },
] as const;

export type NavItem = { href: string; label: string; description?: string };

export const navItems: NavItem[] = [
  { href: "/", label: "Início" },
  { href: "/modpack", label: "O modpack" },
  { href: "/faccoes", label: "Facções" },
  { href: "/progressao", label: "Progressão" },
  { href: "/lore", label: "Lore" },
  { href: "/servidor", label: "Servidor" },
  { href: "/mods", label: "Mods Lazarus" },
  { href: "/baixar", label: "Baixar" },
  { href: "/changelog", label: "Atualizações" },
  { href: "/blog", label: "Blog" },
  { href: "/creditos", label: "Créditos" },
];

// A barra do topo fica enxuta: o logo leva ao início e o botão vermelho ao download.

/** Menu "O modpack" da barra do topo: o que aprofunda o modpack, com uma linha sobre cada página. */
export const modpackMenu: NavItem[] = [
  { href: "/modpack", label: "Visão geral", description: "Sistemas, requisitos e árvores de habilidade." },
  { href: "/progressao", label: "Progressão", description: "Como a dificuldade sobe até o dia 60." },
  { href: "/mods", label: "Mods Lazarus", description: "Os mods escritos para o Project Lazarus." },
];

/** Links soltos da barra do topo, depois do menu "O modpack". */
export const topNav: NavItem[] = [
  { href: "/faccoes", label: "Facções" },
  { href: "/lore", label: "Lore" },
  { href: "/servidor", label: "Servidor" },
  { href: "/changelog", label: "Atualizações" },
];

/** Gaveta do celular e rodapé: tudo, agrupado. */
export const navGroups: { title: string; items: NavItem[] }[] = [
  { title: "O modpack", items: modpackMenu },
  {
    title: "O mundo",
    items: [
      { href: "/faccoes", label: "Facções" },
      { href: "/lore", label: "Lore" },
    ],
  },
  {
    title: "Projeto",
    items: [
      { href: "/servidor", label: "Servidor de guerra" },
      { href: "/changelog", label: "Atualizações" },
      { href: "/blog", label: "Blog" },
      { href: "/creditos", label: "Créditos" },
    ],
  },
];
