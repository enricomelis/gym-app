export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <div className="bg-primary bg-noise hidden flex-col justify-between p-10 lg:flex lg:w-1/2">
        <div>
          <h1 className="text-primary-foreground text-2xl font-bold tracking-tight">GymApp</h1>
        </div>
        <p className="text-primary-foreground/60 text-sm">
          Il tuo percorso di allenamento inizia qui.
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="bg-primary mb-8 flex h-10 w-10 items-center justify-center rounded-lg lg:hidden">
          <span className="text-primary-foreground text-sm font-bold">G</span>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
