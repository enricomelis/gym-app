-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('ALLIEVI', 'JUNIOR', 'SENIOR');

-- CreateTable
CREATE TABLE "Utente" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "dataDiNascita" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Societa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "regione" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Societa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tecnico" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "isSupertecnico" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "utenteId" TEXT NOT NULL,
    "societaId" TEXT NOT NULL,

    CONSTRAINT "Tecnico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Atleta" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "livello" "Categoria" NOT NULL,
    "numeroTessera" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "utenteId" TEXT NOT NULL,
    "societaId" TEXT NOT NULL,

    CONSTRAINT "Atleta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TecnicoAtleta" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tecnicoId" TEXT NOT NULL,
    "atletaId" TEXT NOT NULL,

    CONSTRAINT "TecnicoAtleta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utente_clerkId_key" ON "Utente"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Utente_email_key" ON "Utente"("email");

-- CreateIndex
CREATE INDEX "Utente_id_idx" ON "Utente"("id");

-- CreateIndex
CREATE INDEX "Utente_email_idx" ON "Utente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Societa_nome_key" ON "Societa"("nome");

-- CreateIndex
CREATE INDEX "Societa_id_idx" ON "Societa"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Tecnico_utenteId_key" ON "Tecnico"("utenteId");

-- CreateIndex
CREATE INDEX "Tecnico_utenteId_idx" ON "Tecnico"("utenteId");

-- CreateIndex
CREATE INDEX "Tecnico_societaId_idx" ON "Tecnico"("societaId");

-- CreateIndex
CREATE UNIQUE INDEX "Atleta_numeroTessera_key" ON "Atleta"("numeroTessera");

-- CreateIndex
CREATE UNIQUE INDEX "Atleta_utenteId_key" ON "Atleta"("utenteId");

-- CreateIndex
CREATE INDEX "Atleta_utenteId_idx" ON "Atleta"("utenteId");

-- CreateIndex
CREATE INDEX "Atleta_societaId_idx" ON "Atleta"("societaId");

-- CreateIndex
CREATE INDEX "TecnicoAtleta_tecnicoId_atletaId_idx" ON "TecnicoAtleta"("tecnicoId", "atletaId");

-- CreateIndex
CREATE UNIQUE INDEX "TecnicoAtleta_tecnicoId_atletaId_key" ON "TecnicoAtleta"("tecnicoId", "atletaId");

-- AddForeignKey
ALTER TABLE "Tecnico" ADD CONSTRAINT "Tecnico_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "Utente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tecnico" ADD CONSTRAINT "Tecnico_societaId_fkey" FOREIGN KEY ("societaId") REFERENCES "Societa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atleta" ADD CONSTRAINT "Atleta_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "Utente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atleta" ADD CONSTRAINT "Atleta_societaId_fkey" FOREIGN KEY ("societaId") REFERENCES "Societa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TecnicoAtleta" ADD CONSTRAINT "TecnicoAtleta_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Tecnico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TecnicoAtleta" ADD CONSTRAINT "TecnicoAtleta_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "Atleta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
