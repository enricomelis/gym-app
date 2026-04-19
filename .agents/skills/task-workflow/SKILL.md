---
name: task-workflow
description: Manage work through Linear issues, plan tasks in tasks/todo.md, track progress, and capture lessons in tasks/lesson.md. Use when the user mentions a Linear issue, asks to plan work, or when you need to organize multi-step implementation.
---

# Task Workflow

Use this skill to manage the full lifecycle of a task — from Linear issue to verified completion.

## Linear Integration

- **Linear is the source of truth** for all atomic tasks. Use the Linear MCP server for structured access.
- Issues almost always refer to Linear issues. When ambiguous, ask.
- When starting a new Linear issue, checkout to its namesake branch. Linear issues and Git branches are mapped 1:1.

## Planning

- Write plan to `tasks/todo.md` with checkable items.
- Always focus on one clear, verifiable task at a time.
- If you find it hard to verify your work, alert the developer.

## Progress Tracking

- Mark items complete in `tasks/todo.md` as you go.
- Add a review section to `tasks/todo.md` when done.

## Self-Improvement Loop

- After any correction from the developer, update `tasks/lesson.md` with the pattern.
- Write new rules for yourself to avoid repeating mistakes.
- Review lessons at session start.

## Git Branch Naming

- Never create branches with non-semantic names.
- Follow the structure: `action/description-with-hyphens` (e.g., `feat/add-workout-timer`, `fix/auth-redirect-loop`).
- When working from a Linear issue, use the branch name that maps to that issue.
