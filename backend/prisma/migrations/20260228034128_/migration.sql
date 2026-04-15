/*
  Warnings:

  - A unique constraint covering the columns `[dni]` on the table `Paciente` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dni` to the `Paciente` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN     "dni" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_dni_key" ON "Paciente"("dni");
