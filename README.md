# PeerFolio

PeerFolio e uma plataforma para desenvolvedores compartilharem portfolios, receberem criticas construtivas e evoluirem em comunidade.

Este repositorio usa monorepo com Turborepo, frontend em Next.js e backend em Convex.

## Stack

- `Next.js 16` (App Router)
- `React 19` + `TypeScript`
- `Convex` (queries, mutations, realtime)
- `Clerk` (autenticacao)
- `Tailwind CSS v4`
- `HeroUI` como biblioteca principal de UI
- `packages/ui` com componentes compartilhados (fallbacks shadcn/ui)
- `Turborepo` para orquestracao

## Requisitos

- `bun` `>=1.3`
- Conta/Projeto Convex
- Chaves do Clerk

## Setup rapido

1. Instale dependencias:

```bash
bun install
```

2. Configure Convex:

```bash
bun run dev:setup
```

3. Configure variaveis de ambiente:

- Copie os valores de `packages/backend/.env.local` para `apps/*/.env`
- Defina no Convex Dashboard: `CLERK_JWT_ISSUER_DOMAIN`
- Defina em `apps/*/.env`: `CLERK_PUBLISHABLE_KEY`

4. Rode em desenvolvimento:

```bash
bun run dev
```

App web: `http://localhost:3001`

## Scripts principais

- `bun run dev` - sobe o monorepo em modo desenvolvimento
- `bun run dev:web` - sobe apenas `apps/web`
- `bun run dev:server` - sobe apenas backend Convex
- `bun run build` - build de todos os apps/packages
- `bun run check-types` - checagem de tipos em todo o monorepo
- `bun run prepare` - inicializa git hooks (husky)

## Estrutura do projeto

```text
PeerFolio/
├── apps/
│   └── web/                 # Next.js app
├── packages/
│   ├── backend/
│   │   └── convex/          # Funcoes Convex, schema e regras de dominio
│   └── ui/
│       ├── src/components/  # Componentes compartilhados
│       └── src/styles/      # Tokens e temas globais
```

## UI e temas

- Priorize componentes de `@heroui/react`
- Use `@PeerFolio/ui/components/*` quando precisar de fallback/reuso compartilhado
- Tokens de tema (dark/light) em `packages/ui/src/styles/globals.css`
- Tema controlado por `next-themes` no app web

Import de componentes compartilhados:

```tsx
import { Button } from "@PeerFolio/ui/components/button";
```

## Favicons e metadados de app

No Next.js App Router, os icones globais estao em:

- `apps/web/src/app/favicon.ico`
- `apps/web/src/app/icon.png`
- `apps/web/src/app/apple-icon.png`

## Qualidade e contribuicao

- Commits pequenos e focados
- Sempre rode build/check-types antes de abrir PR
- Evite regressao visual em dark/light theme
