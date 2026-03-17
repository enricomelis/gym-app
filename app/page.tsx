import { prisma } from "../lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-background flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col gap-8 py-16 px-8">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Users ({users.length})
        </h1>
        <div className="flex flex-col gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="border-border bg-card flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex flex-col gap-1">
                <span className="text-card-foreground text-sm font-medium">{user.name}</span>
                <span className="text-muted-foreground text-xs">{user.email}</span>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  user.role === "TECNICO"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                }`}
              >
                {user.role}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
