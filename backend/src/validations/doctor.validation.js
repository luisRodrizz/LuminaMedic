const { z } = require('zod')

const doctorSchema = z.object({
  nombre:          z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido:        z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email:           z.string().email('Email inválido').transform(v => v.toLowerCase().trim()),
  password:        z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  telefono:        z.string().optional(),
  especialidad:    z.string().min(2, 'La especialidad es requerida'),
  descripcion:     z.string().optional(),
  clinicaId:       z.coerce.number().positive('La clínica es requerida'),
  tipoDocumento:   z.enum(['DNI', 'CE', 'PASAPORTE']).default('DNI'),
  numeroDocumento: z.string().min(8, 'El número de documento es requerido').optional(),
  fuenteNombre:    z.string().optional().default('MANUAL')
})

module.exports = { doctorSchema }