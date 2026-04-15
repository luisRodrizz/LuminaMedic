const winston = require('winston')
const path = require('path')

const { combine, timestamp, printf, colorize, errors } = winston.format

// Formato para consola — legible con colores
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => {
    return stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}`
      : `[${timestamp}] ${level}: ${message}`
  })
)

// Formato para archivos — JSON estructurado
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json()
)

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    // Consola — siempre activa
    new winston.transports.Console({
      format: consoleFormat
    }),
    // Archivo errores — solo en producción
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({
        filename: path.join('logs', 'error.log'),
        level: 'error',
        format: fileFormat,
        maxsize: 5 * 1024 * 1024, // 5MB
        maxFiles: 5
      }),
      new winston.transports.File({
        filename: path.join('logs', 'combined.log'),
        format: fileFormat,
        maxsize: 5 * 1024 * 1024,
        maxFiles: 5
      })
    ] : [])
  ]
})

module.exports = logger