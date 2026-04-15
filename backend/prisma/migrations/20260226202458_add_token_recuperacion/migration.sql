-- CreateTable
CREATE TABLE "TokenRecuperacion" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenRecuperacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TokenRecuperacion_token_key" ON "TokenRecuperacion"("token");

-- CreateIndex
CREATE INDEX "Cita_doctorId_fecha_idx" ON "Cita"("doctorId", "fecha");

-- CreateIndex
CREATE INDEX "Cita_pacienteId_fecha_idx" ON "Cita"("pacienteId", "fecha");

-- CreateIndex
CREATE INDEX "Cita_estado_idx" ON "Cita"("estado");

-- CreateIndex
CREATE INDEX "Log_usuarioId_createdAt_idx" ON "Log"("usuarioId", "createdAt");

-- AddForeignKey
ALTER TABLE "TokenRecuperacion" ADD CONSTRAINT "TokenRecuperacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
