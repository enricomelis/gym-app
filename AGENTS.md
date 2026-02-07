# AGENTS.md - Agent Guidelines for Gym App

## Build/Lint/Test Commands

```bash
# Package Manager: Bun (bun@1.3.5)
# Must use 'bun' commands, not npm/yarn/pnpm

# Development
bun dev                    # Start all apps (web:3000, docs:3001)
bun dev --filter=web       # Start specific app
bun dev --filter=docs

# Build
bun run build              # Build all packages and apps
bun run build --filter=web # Build specific app

# Linting & Formatting (ALWAYS use OxLint and OxFmt - NOT ESLint/Prettier)
bun run lint               # Run OxLint on entire codebase
bun run lint:fix           # Run OxLint with auto-fix
bun run format             # Format all files with OxFmt
bun run format:check       # Check formatting without writing
bun run check-types        # Type check all packages

# Single file operations
oxlint src/file.ts         # Lint single file
oxfmt --write src/file.ts  # Format single file

# Note: No test framework configured yet. When adding tests:
# - Prefer Vitest or Bun's native test runner
# - Run single test: bun test path/to/test.ts
```

## Monorepo Structure

```txt
gym-app/
├── apps/
│   ├── web/          # Next.js app (port 3000) - Main application
│   └── docs/         # Next.js app (port 3001) - Documentation
├── packages/
│   ├── ui/           # Shared React component library (@repo/ui)
│   └── typescript-config/ # Shared TS configs (@repo/typescript-config)
├── package.json      # Root workspace config
├── turbo.json        # Turborepo task pipeline
├── .oxlintrc.json    # OxLint configuration
├── .oxfmtrc.json     # OxFmt (formatter) configuration
└── vite.config.ts    # Vite configuration
```

## Tech Stack

- **Runtime/Package Manager**: Bun 1.3.5
- **Framework**: Next.js 16.1.5 (App Router)
- **Build Tool**: Vite 7.3.1 (fast Rust-based bundler)
- **React**: 19.2.0
- **Language**: TypeScript 5.9.2 (strict mode)
- **Styling**: CSS Modules + Tailwind (via @repo/ui)
- **Monorepo**: Turborepo 2.8.3
- **Linting**: OxLint 1.43.0 (fast Rust-based linter)
- **Formatting**: OxFmt 0.28.0 (fast Rust-based formatter, Prettier-compatible)

## Linting & Formatting (OxLint & OxFmt)

**IMPORTANT**: Always use OxLint and OxFmt. ESLint and Prettier have been removed from the project.

### OxLint Configuration

Configuration file: `.oxlintrc.json`

Key features:

- 50-100x faster than ESLint
- Compatible with ESLint rule format
- Supports all major plugins (React, TypeScript, imports, etc.)

```bash
# Basic usage
oxlint .                                    # Lint entire project
oxlint src/                                 # Lint specific directory
oxlint --config .oxlintrc.json src/         # Use specific config
oxlint --fix src/                           # Auto-fix issues

# Rule categories
oxlint -D correctness                       # Deny correctness issues (errors)
oxlint -W suspicious                        # Warn on suspicious code
oxlint -A no-console                        # Allow console statements
```

### OxFmt Configuration

Configuration file: `.oxfmtrc.json`

Key features:

- 30x faster than Prettier
- Prettier-compatible output
- Supports JS, TS, JSX, TSX, JSON, CSS, and more

```bash
# Basic usage
oxfmt --write .                             # Format entire project
oxfmt --check .                             # Check formatting (CI)
oxfmt --write src/                          # Format specific directory
oxfmt --write src/file.ts                   # Format single file

# Key options
oxfmt --list-different .                    # List files that need formatting
oxfmt --no-error-on-unmatched-pattern .     # Don't error on unmatched patterns
```

### Configuration Files

**`.oxlintrc.json`** - Linting rules:

```json
{
  "plugins": ["import", "jsx-a11y", "react", "react-hooks", "typescript"],
  "categories": {
    "correctness": "error",
    "suspicious": "warn",
    "perf": "warn"
  },
  "rules": {
    "eslint/no-debugger": "error",
    "eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "react/react-in-jsx-scope": "off"
  }
}
```

**`.oxfmtrc.json`** - Formatting rules:

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

## Vite Configuration

Vite is configured as the primary build tool for fast development and optimized production builds.

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
```

### Vite Commands

```bash
# Development
vite                          # Start dev server
vite --port 3000              # Start on specific port
vite --host                   # Expose to network

# Production
vite build                    # Build for production
vite build --outDir dist      # Custom output directory
vite preview                  # Preview production build
```

## Code Style Guidelines

### TypeScript Conventions

```typescript
// Use 'interface' for component props and object shapes
interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  appName: string;
}

// Use 'type' for unions, intersections, and complex types
type Theme = 'light' | 'dark';
type PropsWithClass = { className?: string };

// Explicit return types for components
export function Card({ title }: CardProps): JSX.Element {
  return <div>{title}</div>;
}

// Use type imports when importing only types
import type { Metadata } from "next";
import { type ImageProps } from "next/image";

// Strict mode enabled: handle null/undefined properly
// noUncheckedIndexedAccess: true - check array/object access
```

### Import Conventions

```typescript
// 1. External dependencies (React, Next.js)
import { type JSX } from "react";
import localFont from "next/font/local";

// 2. Internal packages (@repo/*)
import { Button } from "@repo/ui/button";

// 3. Relative imports (CSS, local modules)
import styles from "./page.module.css";
import "./globals.css";

// Named exports preferred over default
export function Component() {}
export const helper = () => {};
```

### Component Patterns

```typescript
// Use function declarations for components
export function Card({
  className,
  title,
  children,
  href,
}: CardProps): JSX.Element {
  return (
    <a className={className} href={href}>
      <h2>{title}</h2>
      <p>{children}</p>
    </a>
  );
}

// Client components when needed
"use client";

// Props destructuring in parameters
const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;
  return <Image {...rest} src={srcLight} />;
};

// React 19: React scope not needed for JSX
// React.FC not used; explicit JSX.Element return type preferred
```

### Naming Conventions

- **Components**: PascalCase (`Card`, `ThemeImage`)
- **Files**: kebab-case for pages, PascalCase for components (`page.tsx`, `Card.tsx`)
- **Variables/Functions**: camelCase (`useTheme`, `handleClick`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Types/Interfaces**: PascalCase with Props suffix for component props
- **CSS Modules**: `ComponentName.module.css`
- **Package exports**: `@repo/ui/button` (flat structure from src/)

### Formatting (OxFmt)

- **printWidth**: 100 characters
- **tabWidth**: 2 spaces
- **useTabs**: false (spaces only)
- **semi**: true (always use semicolons)
- **singleQuote**: false (double quotes)
- **trailingComma**: es5 (trailing commas where valid in ES5)
- **bracketSpacing**: true (spaces in object literals)
- **arrowParens**: always (always use parentheses in arrow functions)

OxFmt is **30x faster** than Prettier and produces compatible output. Always run `bun run format` before committing.

## Error Handling

```typescript
// OxLint rules (configured in .oxlintrc.json):
// - correctness: Code that is outright wrong or useless (error level)
// - suspicious: Code that is most likely wrong or useless (warn level)
// - perf: Code that could be more performant (warn level)

// TypeScript strict mode:
// - strict: true
// - noUncheckedIndexedAccess: true (check array access)

// Handle errors gracefully
function safeAccess<T>(arr: T[], index: number): T | undefined {
  return arr[index]; // Must handle undefined due to noUncheckedIndexedAccess
}
```

## Workspace Configuration

```json
// packages/ui exports pattern
{
  "exports": {
    "./*": "./src/*.tsx"
  }
}
```

- Import UI components: `import { Button } from "@repo/ui/button"`
- Shared configs imported via: `@repo/typescript-config`

## Git Workflow

- Main branch: `main` (production)
- Staging branch: `staging`
- Feature branches: Create PRs with meaningful names
- Linear integration for project management
- **Always run `bun run lint` and `bun run format` before committing**

## Environment Variables

- Use `.env*` files (loaded by Turborepo)
- Never commit secrets to the repository

## Important Notes

- **This project uses OxLint and OxFmt exclusively** - ESLint and Prettier have been removed
- **Vite is the build tool** for fast development and optimized production builds
- This is a gym training management app for Italian gymnastics federation
- Hierarchical structure: ZonaTecnica → Regione → Società → Tecnico → Atleta
- MVP focuses on CdP (Codice dei Punteggi) digitization and exercise management
- No test framework configured yet - add Vitest or Bun test when implementing tests
- No Cursor rules or Copilot instructions found in repository
