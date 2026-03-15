# Claude.md

The role of this file is to describe common mistakes and confusion points that agents might encounter as they work in this project.
If you ever encounter something in the project that surprises you, please alert the developer working with you and indicate that this is the case in the AgentMD file to help prevent future agents from having the same issue.

## Main Rules

### 1. Plan Mode by default

- Always enter Plan Mode for non trivial tasks (3+ steps)
- Don't keep pushing when something goes to the side. Stop and re-plan.
- Use plan mode also for verification, not just building.

### 2. Self-Improvement Loop

- After any correction from the developer, update `tasks/lesson.md` with the pattern.
- Write new rules for yourself to not make the same mistakes.
- Review the lessons at session start.

### 3. Verification before Done

- Never mark a task complete before being able to prove it works.
- Ask yourself: "Would a staff engineer approve this?".
- Run tests, check logs and demonstrate correctness.

### 4. Bug fixing

- When given a bug report, fix it without asking for hand-holding.

### 5. Development workflow

- Don't use `npm` or `npx`. Use `bun` and `bunx`.
- After every change, check linting by running `bun run lint`. If some errors arise, run `bun run lint:fix` to fix it.
- After every change, check formatting by running `bun run format:check`. If some errors arise, run `bun run format` to fix it.
- When starting to work on a new Linear issue, checkout to the namesake branch. Linear issues and Git branches are mapped 1:1.
- When committing to git, always use one-liners for the messages.
- Never push any code before having tested it.
- When producing code, always think and propose ways to test it.
- After pushing, check if a PR exists for the branch — if not, create one; if yes, review any Greptile comments.

## Task management

- **Linear**: All atomic tasks are based inside Linear. You have access it with the dedicated MCP. Issues almost always refer to Linear issues.
- **Plan first**: Write plan to `tasks/todo.md` with checkable items.
- **Track progress**: Make items complete as you go.
- **Document results**: Add review section to `tasks/todo.md`.
- **Capture lessons**: Update `tasks/lesson.md` after corrections.
- **Steps**: Always focus on one, clear and verifiable task at a time. If you find hard to verify your work, alert the developer.
- **Git Branches**: Never create git branches with non-semantic names. Follow the structure `branch name: action/description-with-hyphens`.

## Principles

- **Simplicity first**: Make every change as little as possible.
- **No laziness**: Find root causes. Don't find easy fixes with duck-tape.
