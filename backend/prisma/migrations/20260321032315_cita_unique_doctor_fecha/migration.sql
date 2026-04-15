/*
  Warnings:

  - A unique constraint covering the columns `[doctorId,fecha]` on the table `Cita` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Cita_doctorId_fecha_key" ON "Cita"("doctorId", "fecha");
