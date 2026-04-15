-- AlterTable
ALTER TABLE "Clinica" ADD COLUMN     "logoPublicId" TEXT;

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "foto" TEXT,
ADD COLUMN     "fotoPublicId" TEXT;

-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN     "foto" TEXT,
ADD COLUMN     "fotoPublicId" TEXT;
