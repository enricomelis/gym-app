# gym-app

A Next.js app. Uses [Bun](https://bun.sh) as the package manager.

## Getting Started

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Development

| Command                | Description                      |
| ---------------------- | -------------------------------- |
| `bun dev`              | Start the development server     |
| `bun run build`        | Build for production             |
| `bun run lint`         | Run OxLint                       |
| `bun run lint:fix`     | Run OxLint with auto-fix         |
| `bun run format`       | Format with OxFmt                |
| `bun run format:check` | Check formatting without writing |

Linting is configured in `oxlint.json`.

### Testing (Vitest + React Testing Library)

| Command                 | Description                       |
| ----------------------- | --------------------------------- |
| `bun run test`          | Run all tests once                |
| `bun run test:watch`    | Run tests in watch mode           |
| `bun run test:coverage` | Run tests with coverage reporting |

Tests use [Vitest](https://vitest.dev/) with jsdom and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/). Configuration lives in `vitest.config.ts`, and global matchers from `@testing-library/jest-dom` are registered in `vitest.setup.ts`.

Place test files next to the code they test using the `*.test.ts` / `*.test.tsx` naming convention.

### Database (Prisma + PostgreSQL)

| Command                                               | Description                                       |
| ----------------------------------------------------- | ------------------------------------------------- |
| `bun --bun run prisma migrate dev --name your-change` | Create and apply a migration after schema changes |
| `bun --bun run prisma generate`                       | Regenerate the client without migrating           |
| `bun run prisma/seed.ts`                              | Seed the database with sample data                |
| `bun --bun run prisma migrate reset`                  | Drop all tables, re-migrate, and re-seed          |
| `bun --bun run prisma studio`                         | Open the Prisma Studio GUI                        |

## Contributing

### Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Styling:** Tailwind CSS v4 (PostCSS-based, no `tailwind.config.ts`)
- **UI Components:** shadcn/ui (base-nova style)
- **Auth:** better-auth with Prisma adapter
- **Database:** PostgreSQL via Prisma ORM
- **Forms:** react-hook-form + Zod validation
- **Testing:** Vitest + React Testing Library
- **Linting:** OxLint | **Formatting:** OxFmt

### Project Structure

```
app/            → Next.js pages and layouts (App Router)
components/     → Reusable UI components (shadcn/ui)
lib/            → Shared utilities and configuration
prisma/         → Schema, migrations, and seed scripts
public/         → Static assets
```

### Workflow

1. Use `bun` as the package manager (not npm/npx).
2. Before committing, ensure your code passes both linting and formatting:
   ```bash
   bun run lint
   bun run format:check
   ```
3. Run tests before pushing:
   ```bash
   bun run test
   ```
4. Branch names should follow the convention: `action/description-with-hyphens` (e.g. `feature/user-profile`, `fix/login-redirect`).

## AI-Assisted Development

This project uses AI tooling throughout the development workflow.

- **Agents:** Claude Code (primary), Cursor, Codex
- **MCP Servers:** Linear (task management), Next DevTools, Neon (database), Railway (deployment)
- **Skills:** frontend-design
