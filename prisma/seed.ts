import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        email: "ghilarduccidavid@gmail.com",
        password: "hashed_placeholder_1",
        role: "TECNICO",
      },
      {
        email: "enrico.melis.casa@gmail.com",
        password: "hashed_placeholder_2",
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
