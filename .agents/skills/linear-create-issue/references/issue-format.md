# Linear Issue Format

## Defaults for this workspace

- Assignee: `Enrico Melis`
- Team: `Gym App 2`
- Cycle: current cycle if the user does not specify one
- Language: Italian unless the user requests otherwise

## Mapping request -> issue

- First sentence or headline -> title
- Short explanation -> `## Sintesi`
- Bullet list of work -> `## Attività`
- Acceptance criteria -> `## Criteri di accettazione`
- Plain-text dependencies -> `## Bloccata da`
- Real Linear issue IDs -> `blockedBy` relations

## Practical rules

- Keep the title short and action-oriented.
- Keep the description structured and skimmable.
- Do not invent labels or projects.
- Use the current cycle only when the user does not specify another cycle.

## Example

```md
## Sintesi
Scheletro dell'area autenticata. Mostra i dati della sessione e permette il logout.

## Attività
- Creare `/app/dashboard/layout.tsx` con header/nav placeholder
- Mostrare nome e email dell'utente loggato con dati server-side
- Aggiungere pulsante logout che chiama `BetterAuth signOut()`
- Redirect a `/login` dopo logout riuscito
- Creare `/app/dashboard/page.tsx` con messaggio di benvenuto

## Bloccata da
- middleware route protection
- pagina `/login`

## Criteri di accettazione
- Il nome utente è visibile nell'header del dashboard
- Il logout svuota la sessione e reindirizza a `/login`
- `/dashboard/page.tsx` mostra un messaggio di benvenuto con il nome utente
```
