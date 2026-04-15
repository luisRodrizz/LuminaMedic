const { z } = require('zod')

const servicioSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  precio: z.coerce.number().positive('El precio debe ser mayor a 0'),
  duracion: z.coerce.number().positive('La duración debe ser mayor a 0'),
  clinicaId: z.coerce.number().positive('La clínica es requerida')
})

module.exports = { servicioSchema }