const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
})

const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Demasiadas solicitudes de recuperación. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
})

// ── NUEVO: Consultas DNI/RENIEC ───────────────────────
// Evita usar la API como proxy masivo de consultas RENIEC
const dniLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Demasiadas consultas de DNI. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
})

// ── NUEVO: Registro de pacientes ──────────────────────
// Evita creación masiva de cuentas falsas
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Demasiados registros desde esta IP. Intenta de nuevo en una hora.' },
  standardHeaders: true,
  legacyHeaders: false
})

// ── NUEVO: Notas clínicas ─────────────────────────────
// Evita spam de requests al endpoint de notas
const notaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
})

const apiLimiter = process.env.NODE_ENV === 'production'
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: { message: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' },
      standardHeaders: true,
      legacyHeaders: false
    })
  : (req, res, next) => next()

module.exports = { loginLimiter, forgotLimiter, apiLimiter, dniLimiter, registerLimiter, notaLimiter }