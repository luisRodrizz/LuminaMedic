/*
  Warnings:

  - A unique constraint covering the columns `[dni]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "dni" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_dni_key" ON "Doctor"("dni");
