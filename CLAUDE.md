# Claude.md

The role of this file is to describe common mistakes and confusion points that agents might encounter as they work in this project.
If you ever encounter something in the project that surprises you, please alert the developer working with you and indicate that this is the case in the AgentMD file to help prevent future agents from having the same issue.

## Rules

### Project management

- Before addressing any task, make sure to check any related Linear issue.
- Always focus on one, clear and verifiable task at a time. If you find hard to verify your work, alert the developer.
- Assume that "issues" refers to Linear issues (accessible through MCP) unless anything else is specified.
- Never create git branches with non-semantic names. Follow the structure `branch name: action/description-with-hyphens`.

### Development workflow

- Don't use `npm` or `npx`. Use `bun` and `bunx`.
- After every change, check linting by running `bun run lint`. If some errors arise, run `bun run lint:fix` to fix it.
- After every change, check formatting by running `bun run format:check`. If some errors arise, run `bun run format` to fix it.
- When starting to work on a new Linear issue, checkout to the namesake branch. Linear issues and Git branches are mapped 1:1.
- When committing to git, always use one-liners for the messages.
- After pushing, check if a PR exists for the branch — if not, create one; if yes, review any Greptile comments.
