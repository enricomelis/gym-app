-- CreateEnum
CREATE TYPE "Attrezzo" AS ENUM ('CL', 'CM', 'AN', 'VT', 'PP', 'SB');

-- CreateEnum
CREATE TYPE "ExerciseElementRole" AS ENUM ('STANDARD', 'USCITA', 'VOLTEGGIO');

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "attrezzo" "Attrezzo" NOT NULL,
    "createdById" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseElement" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "elementId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "role" "ExerciseElementRole" NOT NULL DEFAULT 'STANDARD',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseElement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Exercise_createdById_idx" ON "Exercise"("createdById");

-- CreateIndex
CREATE INDEX "Exercise_createdById_attrezzo_idx" ON "Exercise"("createdById", "attrezzo");

-- CreateIndex
CREATE INDEX "ExerciseElement_exerciseId_idx" ON "ExerciseElement"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseElement_exerciseId_order_key" ON "ExerciseElement"("exerciseId", "order");

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseElement" ADD CONSTRAINT "ExerciseElement_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
