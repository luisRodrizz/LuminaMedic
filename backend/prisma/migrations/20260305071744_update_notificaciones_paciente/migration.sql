-- DropForeignKey
ALTER TABLE "Notificacion" DROP CONSTRAINT "Notificacion_doctorId_fkey";

-- AlterTable
ALTER TABLE "Notificacion" ADD COLUMN     "pacienteId" INTEGER,
ALTER COLUMN "doctorId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Notificacion_pacienteId_leida_idx" ON "Notificacion"("pacienteId", "leida");

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
