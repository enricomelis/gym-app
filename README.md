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

### Database (Prisma + PostgreSQL)

| Command                                               | Description                                       |
| ----------------------------------------------------- | ------------------------------------------------- |
| `bun --bun run prisma migrate dev --name your-change` | Create and apply a migration after schema changes |
| `bun --bun run prisma generate`                       | Regenerate the client without migrating           |
| `bun run prisma/seed.ts`                              | Seed the database with sample data                |
| `bun --bun run prisma migrate reset`                  | Drop all tables, re-migrate, and re-seed          |
| `bun --bun run prisma studio`                         | Open the Prisma Studio GUI                        |
