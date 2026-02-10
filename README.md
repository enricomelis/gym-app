# Gym App

Sistema completo per la gestione degli allenamenti della ginnastica artistica maschile italiana.

## Indice

- [Visione e Problema](#visione-e-problema)
- [Utenti](#utenti)
- [Stack Tecnologico](#stack-tecnologico)
- [Architettura](#architettura)
- [Roadmap](#roadmap)
- [Flusso di Sviluppo](#flusso-di-sviluppo)

## Visione e Problema

### Obiettivo

Fornire uno strumento semplice, veloce e completo per la gestione degli allenamenti della ginnastica artistica maschile, progettato specificamente per la Federazione Italiana Ginnastica (FIG).

### Il Problema

Al giorno d'oggi non esiste nessun sistema, tanto meno personalizzato per la Federazione italiana, per una gestione omnicomprensiva e sistematica degli allenamenti della ginnastica. Questo strumento si pone come soluzione creando tecnologie per gestire in modo semplice e chiaro la preparazione alla gara, la preparazione fisica e qualsiasi altro aspetto dell'allenamento dentro e fuori la palestra.

### Utenti Target

- Tecnici e atleti
- Direzioni tecniche (DTN, DTR)

## Utenti

### Tecnici

Il tecnico e colui che ha la possibilita di creare la programmazione.

- Creare cicli preimpostati per la programmazione pre-gara
- Modificare la programmazione a livello del singolo allenamento
- Costruire molteplici esercizi specifici per ogni singolo atleta sotto la sua supervisione

### Atleti

Gli atleti hanno ruolo ridotto all'interno delle funzionalita nucleo dell'app. Alla fine della storia, loro devono allenarsi.

- Strumento per analizzarsi
- Inserire cio che hanno fatto durante un allenamento
- Luogo dove confrontare velocemente il CdP e la loro programmazione

### Super Tecnici

I Supertecnici sono dei tecnici che hanno ruoli speciali all'interno della Federazione.

- Un Direttore Tecnico Regionale puo voler vedere e tenere d'occhio tutti i ginnasti all'interno della sua regione di competenza
- Gestire eventuali allenamenti speciali e collegiali
- Suggerire metodologie di lavoro ad altri tecnici

## Stack Tecnologico

### Monorepo e Tooling

- **Turborepo**: Gestione della monorepo
- **Bun**: Runtime e package manager
- **OxLint**: Linting
- **OxFmt**: Formattazione codice
- **TypeScript**: Type safety
- **Vite**: Build tool e developer experience

### Frontend

- **Next.js**: Framework React principale con routing
- **Shadcn/ui**: Libreria di componenti
- **TailwindCSS**: Styling
- **Railway**: Hosting

### Backend

- **Hono**: Framework API
- **PostgreSQL**: Database
- **Prisma**: ORM
- **tRPC**: API type-safe
- **Railway**: Hosting

### Infrastruttura

- **Railway**: Hosting unificato (web + API + database)
- **Clerk**: Autenticazione
- **Sentry**: Error tracking
- **GitHub Actions**: CI/CD

### Sviluppo

- **Linear**: Project management
- **Git**: Source control

## Architettura

### Struttura Gerarchica

```
ZonaTecnica (Nord, Centro, Sud)
└── Regione
    └── Societa
        └── Tecnico
            └── Atleta
```

### Struttura Monorepo

```
gym-app/
├── apps/
│   ├── web/          # Next.js app (porta 3000) - Applicazione principale
│   └── docs/         # Next.js app (porta 3001) - Documentazione
├── packages/
│   ├── ui/           # Libreria componenti React condivisa (@repo/ui)
│   └── typescript-config/ # Configurazioni TS condivise (@repo/typescript-config)
├── package.json      # Configurazione workspace root
├── turbo.json        # Task pipeline Turborepo
├── .oxlintrc.json    # Configurazione OxLint
├── .oxfmtrc.json     # Configurazione OxFmt
└── vite.config.ts    # Configurazione Vite
```

### Supporto Offline

Per il momento non e una priorita. In futuro sara possibile operare sull'applicazione offline e poi sincronizzare i dati appena si ha accesso ad internet.

## Roadmap

### MVP (Minimum Viable Product)

#### Autenticazione

- Auth per Tecnico e Atleta con Clerk (Email + Password)
- Dashboard minimal a role-based

#### Implementazione del CdP

- Digitalizzazione di tutti gli elementi
- Visualizzazione tabellare degli elementi
- Ricerca avanzata: filtri (attrezzo e/o difficolta), ricerca (nome, figId)

#### Gestione Atleti

- Tecnico: CRUD su atleti
- Visualizzazione lista
- Info singolari

#### Esercizi

- Creazione di un esercizio svincolato
- Ordinare elementi (drag & drop)
- Salvare esercizio collegato ad atleta
- Visualizzare lista esercizi per atleta

#### Vista Atleta

- Visualizzazione esercizi
- Consultazione del CdP

### Fase 1: Programmazione

- **Cicli, Settimane, Giorni, Allenamenti**: Struttura ciclica
- **Preset e riutilizzo**: Programmazione basata su template
- **Supertecnico**: Funzionalita di supervisione regionale

### Fase 2: Avanzate

- **Tracking Allenamenti**: Logging dettagliato degli allenamenti
- **Preparazione fisica**: Programmi di condizionamento integrati
- **Skill Mastery**: Tracciamento progressi su skill specifiche
- **Mobile App**: Esperienza mobile nativa

### Idee Future

#### Salute Fisica e Mentale

Integrazione con professionisti della salute:

- Principi di fisioterapia
- Psicoterapia
- Nutrizionismo

#### Digitalizzazione PT

Digitalizzazione dei programmi tecnici per i giovanissimi e per chi fa riferimento ai programmi tecnici.

## Flusso di Sviluppo

### GitHub Flow

- `main` e `staging` sono ambienti anche in Railway
- Ogni nuova feature e una PR con naming convention significativa
- Integrazione su Linear

### Comandi di Build

```bash
# Sviluppo
bun dev                             # Avvia tutte le app
bun dev --filter=web                # Avvia solo web app
bun dev --filter=docs               # Avvia solo docs app

brew services start postgresql@18   # Avvia il db locale
brew services stop postgresql@18    # Ferma il db locale

# Build
bun run build                       # Build di tutti i pacchetti e app

# Linting e Formattazione
bun run lint                        # Esegue OxLint
bun run lint:fix                    # Esegue OxLint con auto-fix
bun run format                      # Formatta tutti i file
bun run format:check                # Controlla formattazione senza scrivere
bun run check-types                 # Type check di tutti i pacchetti
```

## Contribuire

Questo progetto segue standard rigorosi di qualita del codice usando OxLint e OxFmt. Tutti i contributi devono passare linting e type checking prima del merge.

## Licenza

[Informazioni licenza da aggiungere]
