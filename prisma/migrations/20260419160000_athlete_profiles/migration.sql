-- CreateTable
CREATE TABLE "Athlete" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "normalizedFirstName" TEXT NOT NULL,
    "normalizedLastName" TEXT NOT NULL,
    "birthDate" DATE NOT NULL,
    "tesseraNumber" TEXT,
    "normalizedTesseraNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Athlete_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Athlete_normalizedTesseraNumber_key" ON "Athlete"("normalizedTesseraNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Athlete_coachId_normalizedFirstName_normalizedLastName_birthDate_key" ON "Athlete"("coachId", "normalizedFirstName", "normalizedLastName", "birthDate");

-- CreateIndex
CREATE INDEX "Athlete_coachId_idx" ON "Athlete"("coachId");

-- CreateIndex
CREATE INDEX "Athlete_coachId_normalizedLastName_normalizedFirstName_idx" ON "Athlete"("coachId", "normalizedLastName", "normalizedFirstName");

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
