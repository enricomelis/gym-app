---
name: linear-create-issue
description: Create Linear issues for this Gym App workspace from brief specs, bug reports, or feature requests. Use when the user asks to open, draft, or structure a new Linear issue and the issue should default to Enrico Melis as assignee and the current team cycle when omitted.
---

# Linear Issue Creator

Use this skill to turn a short request into a well-formed Linear issue for this project.

## Rules

- Write issue text in Italian unless the user explicitly asks for another language.
- Default assignee: `Enrico Melis`.
- Default team: `Gym App 2`.
- If no cycle is specified, use the team's current cycle.
- Leave project and labels unset unless the user specifies them or the request clearly requires them.
- Use `blockedBy` only for real Linear issue identifiers. If the user gives plain-text dependencies, keep them in the description under `Bloccata da`.

## Workflow

1. Extract a concise title from the request.
2. Rewrite the request as a Linear-ready description with:
   - short summary
   - implementation steps
   - acceptance criteria
   - blockers/dependencies
3. Resolve the team and cycle:
   - use `Gym App 2` if the user does not specify a team
   - call `mcp__linear__list_cycles` for `Gym App 2` when the cycle is omitted
4. Create the issue with `mcp__linear__save_issue`.
5. Report the created issue title, assignee, team, and cycle back to the user.

## Issue Structure

Use this shape for the issue body:

```md
## Sintesi
...

## Attività
- ...
- ...

## Criteri di accettazione
- [ ] ...
- [ ] ...

## Bloccata da
- ...
```

## Notes

- Keep the title short and specific.
- Prefer one issue per clear outcome.
- If the request is ambiguous about the team and cannot reasonably be inferred, ask for clarification before creating the issue.
