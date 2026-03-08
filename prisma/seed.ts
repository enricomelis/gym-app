import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        name: "David Ghilarducci",
        email: "ghilarduccidavid@gmail.com",
        role: "TECNICO",
      },
      {
        name: "Enrico Melis",
        email: "enrico.melis.casa@gmail.com",
        role: "ATLETA",
      },
    ],
  });

  console.log("Seeded 2 users");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
