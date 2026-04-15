const { z } = require('zod')

const citaSchema = z.object({
  // Fecha: debe ser ISO válido y no puede ser en el pasado
  fecha: z.string()
    .min(1, 'La fecha es requerida')
    .refine((val) => {
      const fecha = new Date(val)
      return !isNaN(fecha.getTime())
    }, 'Fecha inválida')
    .refine((val) => {
      const fecha = new Date(val)
      const ahora = new Date()
      return fecha > ahora
    }, 'No puedes agendar una cita en el pasado'),

  motivo: z.string().max(500, 'El motivo no puede superar 500 caracteres').optional(),

  doctorId: z.coerce.number().positive('El doctor es requerido'),
  pacienteId: z.coerce.number().positive().optional(), // opcional porque PACIENTE lo toma de sesión
  servicioId: z.coerce.number().positive('El servicio es requerido')
})

const estadoSchema = z.object({
  estado: z.enum(['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'])
})

module.exports = { citaSchema, estadoSchema }