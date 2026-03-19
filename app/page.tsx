import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center font-sans">
      <main className="flex flex-col items-center gap-6 px-8 text-center">
        <h1 className="text-foreground text-4xl font-bold tracking-tight">Gym App</h1>
        <p className="text-muted-foreground max-w-md text-lg">
          Gestisci i tuoi allenamenti e i tuoi clienti in un unico posto.
        </p>
        <Link
          href="/login"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-8 text-sm font-medium transition-colors"
        >
          Accedi
        </Link>
      </main>
    </div>
  );
}
