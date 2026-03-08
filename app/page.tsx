import { prisma } from "../lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
	const users = await prisma.user.findMany({
		orderBy: { createdAt: "desc" },
	});

	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<main className="flex min-h-screen w-full max-w-3xl flex-col gap-8 py-16 px-8">
				<h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
					Users ({users.length})
				</h1>
				<div className="flex flex-col gap-4">
					{users.map((user) => (
						<div
							key={user.id}
							className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
						>
							<div className="flex flex-col gap-1">
								<span className="text-sm font-medium text-black dark:text-zinc-100">
									{user.email}
								</span>
								<span className="text-xs text-zinc-500">
									{user.createdAt.toLocaleDateString("it-IT")}
								</span>
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
