const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  // Loguear siempre con Winston — stack completo en logs
  logger.error(`${req.method} ${req.path} — ${err.message}`, {
    stack: err.stack,
    code: err.code,
    status: err.status || 500
  })

  // Errores conocidos de Prisma
  if (err.code === 'P2002') {
    return res.status(400).json({ message: 'Ya existe un registro con ese dato único' })
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Registro no encontrado' })
  }

  // En producción no exponer detalles del error al cliente
  const message = process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : err.message || 'Error interno del servidor'

  res.status(err.status || 500).json({ message })
}

module.exports = errorHandler