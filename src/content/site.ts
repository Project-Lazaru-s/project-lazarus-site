const repo = "https://github.com/Project-Lazaru-s/project-lazarus-modpack";

export const site = {
  name: "Project Lazarus",
  version: "1.0.0",
  releaseDate: "2026-10-22",
  tagline: "A cidade caiu. Você ainda não.",
  description:
    "Modpack de sobrevivência num apocalipse zumbi para Minecraft Java 1.20.1 (Forge). Coma, beba água limpa, se esconda, negocie com facções e evolua habilidades. Cada dia é mais difícil que o anterior.",
  author: { name: "Kaique Melo", github: "https://github.com/KaiD3v" },
} as const;

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
  { label: "Mods", value: "102 do CurseForge + 8 Lazarus" },
  { label: "Extras", value: "4 resource packs, 3 shaders" },
  { label: "Modos", value: "Singleplayer e servidor" },
  { label: "Voz", value: "Simple Voice Chat" },
] as const;

export type NavItem = { href: string; label: string };

export const navItems: NavItem[] = [
  { href: "/", label: "Início" },
  { href: "/modpack", label: "O modpack" },
  { href: "/faccoes", label: "Facções" },
  { href: "/progressao", label: "Progressão" },
  { href: "/mods", label: "Mods Lazarus" },
  { href: "/baixar", label: "Baixar" },
  { href: "/changelog", label: "Atualizações" },
  { href: "/blog", label: "Blog" },
  { href: "/creditos", label: "Créditos" },
];
