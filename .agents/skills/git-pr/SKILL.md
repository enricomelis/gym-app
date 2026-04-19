---
name: git-pr
description: Git workflow for committing, pushing, and creating PRs. Covers commit conventions, testing before push, PR creation, and Greptile review. Use when the user asks to commit, push, or open a pull request.
---

# Git & PR Workflow

Use this skill when performing git operations — committing, pushing, or creating pull requests.

## Commit Rules

- Use one-liner commit messages. Be concise and descriptive.
- Never push any code before having tested it.

## Push & PR Flow

1. **Test first** — prove the code works before pushing.
2. **Push** — push the branch to remote.
3. **PR check** — after pushing, check if a PR exists for the branch:
   - If no PR exists, create one. Each pr should have a name of `type/description-with-dashes`.
   - If a PR exists, review any Greptile comments and address them.

## Branch Protection

- **Never push to master** without explicit permission.
- Always prefer creating a PR, even for small and non-breaking changes.
