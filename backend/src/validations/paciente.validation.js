const { z } = require('zod')

const pacienteSchema = z.object({
  nombre:          z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido:        z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email:           z.string().email('Email inválido').transform(v => v.toLowerCase().trim()),
  password:        z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  telefono:        z.string().optional(),
  fechaNac:        z.string().optional(),
  genero:          z.string().optional(),
  direccion:       z.string().optional(),
  alergias:        z.string().optional(),
  tipoDocumento:   z.enum(['DNI', 'CE', 'PASAPORTE']).default('DNI'),
  numeroDocumento: z.string().min(8, 'El número de documento es requerido'),
  fuenteNombre:    z.string().optional().default('MANUAL'),
  validacionReniec: z.string().optional().default('PENDIENTE')
})

module.exports = { pacienteSchema }