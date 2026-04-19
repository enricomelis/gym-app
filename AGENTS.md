# Agents.md

Common rules for agents working in this project.
If something surprises you, alert the developer and update this file.

## Core Rules

- UX is for **Italian users**. All UI text must be in Italian.
- Never make changes on the `master` branch. Before any change, create a dedicated branch or checkout to the relevant one (if exists).
- Prefer git worktrees and always tell the developer WHERE you are working and HOW the developer can test your changes.
- The `.agents/` directory is the source of truth for skills, MCP servers, and agent behavior.
- Use `bun` and `bunx` — never `npm` or `npx`.
- After every code change, run `bun run lint` (fix: `bun run lint:fix`) and `bun run format:check` (fix: `bun run format`).
- Prefer MCP servers over abstract/inferred commands when a structured tool exists.

## Security & Reliability

Every piece of code you produce must be **secure by default** and **debuggable in production**. Assume your code will cause problems — your job is to prove it won't.

### Security

- **Validate at every boundary**: user input, API params, query strings, form data, headers. Never trust external data.
- **OWASP Top 10 awareness**: actively check for XSS, SQL injection, CSRF, SSRF, broken auth, mass assignment, and insecure deserialization in every change you make.
- **Secrets**: never hardcode tokens, keys, or credentials. Never log them. Never commit `.env` files.
- **Auth & access control**: verify that every new endpoint or server action enforces proper authentication and authorization. If unsure, flag it.
- **Dependencies**: when adding a new package, consider its security posture (maintenance, known CVEs, scope of permissions).
- After writing code, ask yourself: **"How could an attacker abuse this?"** If you can think of a way, fix it before marking done.

### Logging & Debuggability

- Add `console.log` or structured logging at meaningful points: function entry with key params, error catch blocks, state transitions, external API calls (request + response status).
- Use clear prefixes: `[ModuleName]` or `[FeatureName]` so logs are filterable.
- **Never log sensitive data** (passwords, tokens, PII). Log identifiers and status codes, not payloads.
- Error handling must always log the error with context before re-throwing or returning. Silent failures are bugs.
- After writing code, ask yourself: **"How can a user break this?"** If you can think of a way, fix it before marking done.

## Coding Standards

- **Plan first**: enter Plan Mode for non-trivial tasks (3+ steps). Re-plan when things drift.
- **Verify before done**: prove it works — tests, logs, demonstration. Ask: "Would a staff engineer approve this?"
- **Bug fixing**: fix it without hand-holding. Find root causes, not duct-tape.
- **Simplicity**: make every change as small as possible.

## Skills Reference

For workflows beyond pure coding, use the appropriate skill:

| Skill | When to use |
|---|---|
| `task-workflow` | Linear issues, `tasks/todo.md` planning, progress tracking, lesson capture, git branch naming |
| `git-pr` | Committing, pushing, PR creation, Greptile review, branch conventions |
| `linear-create-issue` | Creating well-formed Linear issues from brief requests |
| `frontend-design` | Building polished, distinctive UI components |
| `neon-postgres` | Neon Serverless Postgres guidance |
