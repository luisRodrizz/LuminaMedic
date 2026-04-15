require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')

const authRoutes        = require('./routes/auth.routes')
const clinicaRoutes     = require('./routes/clinica.routes')
const doctorRoutes      = require('./routes/doctor.routes')
const servicioRoutes    = require('./routes/servicio.routes')
const pacienteRoutes    = require('./routes/paciente.routes')
const citaRoutes        = require('./routes/cita.routes')
const logRoutes         = require('./routes/log.routes')
const reporteRoutes     = require('./routes/reporte.routes')
const estadisticaRoutes = require('./routes/estadistica.routes')
const pagoRoutes        = require('./routes/pago.routes')
const horarioRoutes     = require('./routes/horario.routes')
const notificacionRoutes = require('./routes/notificacion.routes')
const logger = require('./utils/logger')
const errorHandler      = require('./middlewares/error.middleware')
const { apiLimiter, loginLimiter } = require('./middlewares/rateLimit.middleware')
const { iniciarRecordatorios } = require('./services/recordatorio.service')

const app = express()
const PORT = process.env.PORT || 4000

// ─── Seguridad HTTP ───────────────────────────────────
app.use(helmet())

// ─── CORS estricto ────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173']

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS bloqueado para origen: ${origin}`))
  },
  credentials: true
}))

// ─── Body parsing con límite ──────────────────────────
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// ─── Rate limiting global ─────────────────────────────
app.use('/api', apiLimiter)

// ─── Rutas ────────────────────────────────────────────
app.use('/api/auth',          authRoutes)
app.use('/api/clinica',       clinicaRoutes)
app.use('/api/doctores',      doctorRoutes)
app.use('/api/servicios',     servicioRoutes)
app.use('/api/pacientes',     pacienteRoutes)
app.use('/api/citas',         citaRoutes)
app.use('/api/logs',          logRoutes)
app.use('/api/reportes',      reporteRoutes)
app.use('/api/estadisticas',  estadisticaRoutes)
app.use('/api/pagos',         pagoRoutes)
app.use('/api/notificaciones', notificacionRoutes)
app.use('/api/horarios',      horarioRoutes)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  next()
}, express.static('uploads'))

// ─── Healthcheck ──────────────────────────────────────
app.get('/health', async (req, res) => {
  const inicio = Date.now()
  try {
    const prisma = require('./prisma/client')
    await prisma.$queryRaw`SELECT 1`
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      db: 'ok',
      responseTime: `${Date.now() - inicio}ms`
    })
  } catch (error) {
    logger.error('Health check failed — DB unreachable', { error: error.message })
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      db: 'unreachable',
      error: 'Database connection failed'
    })
  }
})

app.get('/', (req, res) => {
  res.json({ message: 'Servidor de Clínica funcionando ✅' })
})

// ─── Error handler global ─────────────────────────────
app.use(errorHandler)

iniciarRecordatorios()

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Servidor corriendo en http://localhost:${PORT}`)
    logger.info(`Entorno: ${process.env.NODE_ENV || 'development'}`)
    logger.info(`CORS permitido para: ${allowedOrigins.join(', ')}`)
  })
}

module.exports = app