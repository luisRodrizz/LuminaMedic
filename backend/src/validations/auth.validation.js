const { z } = require('zod')
const zxcvbn = require('zxcvbn')

const registerSchema = z.object({
  nombre:   z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email:    z.string().email('Email inválido').transform(v => v.toLowerCase().trim()),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
    .refine(val => {
      const result = zxcvbn(val)
      return result.score >= 2
    }, 'La contraseña es muy común o débil. Usa una combinación de letras, números y símbolos.'),
  telefono:        z.string().optional(),
  tipoDocumento:   z.string().optional(),
  numeroDocumento: z.string().optional(),
  fuenteNombre:    z.string().optional(),
  fechaNac: z.string()
    .refine(val => {
      if (!val) return false
      const fecha = new Date(val)
      return !isNaN(fecha.getTime())
    }, 'Fecha de nacimiento inválida')
    .refine(val => {
      const fecha = new Date(val)
      const hoy = new Date()
      const edad = hoy.getFullYear() - fecha.getFullYear() -
        (hoy < new Date(hoy.getFullYear(), fecha.getMonth(), fecha.getDate()) ? 1 : 0)
      return edad >= 18
    }, 'Debes tener al menos 18 años para registrarte. Los menores de edad deben ser registrados por un tutor o padre desde la clínica.'),
})

const loginSchema = z.object({
  email:    z.string().email('Email inválido').transform(v => v.toLowerCase().trim()),
  password: z.string().min(1, 'La contraseña es requerida')
})

module.exports = { registerSchema, loginSchema }