/*
  Warnings:

  - You are about to drop the column `dni` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `dni` on the `Paciente` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[numeroDocumento]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[numeroDocumento]` on the table `Paciente` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `numeroDocumento` to the `Paciente` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Doctor_dni_key";

-- DropIndex
DROP INDEX "Paciente_dni_key";

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "dni",
ADD COLUMN     "fuenteNombre" TEXT NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "numeroDocumento" TEXT,
ADD COLUMN     "tipoDocumento" TEXT NOT NULL DEFAULT 'DNI',
ADD COLUMN     "validacionReniec" TEXT NOT NULL DEFAULT 'PENDIENTE';

-- AlterTable
ALTER TABLE "Paciente" DROP COLUMN "dni",
ADD COLUMN     "fuenteNombre" TEXT NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "numeroDocumento" TEXT NOT NULL,
ADD COLUMN     "tipoDocumento" TEXT NOT NULL DEFAULT 'DNI',
ADD COLUMN     "validacionReniec" TEXT NOT NULL DEFAULT 'PENDIENTE';

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_numeroDocumento_key" ON "Doctor"("numeroDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_numeroDocumento_key" ON "Paciente"("numeroDocumento");
