# Project Lazarus: site oficial

Site do [Project Lazarus](https://github.com/Project-Lazaru-s/project-lazarus-modpack), modpack de sobrevivência zumbi para Minecraft 1.20.1 (Forge).

Next.js 16 (App Router, Cache Components), Tailwind CSS 4, Vitest + Testing Library + MSW, Playwright.

## Rodando

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # unitários e de integração (Vitest)
npm run test:e2e     # E2E (Playwright: faz build e sobe o servidor)
npm run typecheck
npm run lint
```

`GITHUB_TOKEN` (opcional) aumenta o limite da API do GitHub usada no changelog.

## Estrutura

```
content/blog/       posts em Markdown (frontmatter: title, date, summary, draft?)
public/images/      banners dos mods e prévias de skins
src/app/            rotas: só compõem páginas
src/components/     UI (layout/, ui/, mods/, blog/, releases/)
src/content/        dados tipados do site: links, mods, facções, progressão, sistemas, créditos
src/lib/            regras: blog (leitura de posts), releases (API do GitHub), markdown, formatação
src/lib/games/      motores puros dos minigames (furtividade, horda), testados sem navegador
src/lib/survival/   estado do sobrevivente na landing (dias, medo, abates) e som ambiente sintetizado
public/images/game/ sprites em pixel art (gerados com o Codex)
assets/og/          fonte (Saira Stencil One, licença OFL) e sprites do cartão compartilhável /dossie/[code]
e2e/                testes de ponta a ponta
```

## Tarefas comuns

- **Novo post:** crie `content/blog/<slug>.md`. Use `draft: true` para esconder.
- **Nova release:** nada a fazer. O changelog lê as releases do GitHub e se atualiza a cada hora.
- **Nova versão de um mod:** altere `version` em `src/content/mods.ts` e o teste de versões em `src/content/content.test.ts`.
- **Nova facção ou mod:** uma entrada em `src/content/`. As páginas se montam sozinhas.

## Regras de conteúdo (cobertas por testes)

- A versão pública é 1.0.0. Nada de "alpha" no site.
- Sem links inventados de Discord, CurseForge ou Modrinth.
- O download aponta para `releases/latest` no GitHub; mods de terceiros não são redistribuídos.

Modpack, mods Lazarus, configs, scripts e este site: todos os direitos reservados.
