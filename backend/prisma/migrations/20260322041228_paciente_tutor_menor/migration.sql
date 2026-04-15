-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN     "esMenor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tutorDni" TEXT,
ADD COLUMN     "tutorNombre" TEXT,
ADD COLUMN     "tutorTelefono" TEXT;
