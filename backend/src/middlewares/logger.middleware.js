const prisma = require('../prisma/client')

// Campos sensibles que NUNCA se guardan en logs
const CAMPOS_SENSIBLES = ['password', 'diagnostico', 'tratamiento', 'receta', 'observacion', 'token']

const sanitizarBody = (body) => {
  if (!body || typeof body !== 'object') return {}
  const sanitizado = {}
  for (const [key, value] of Object.entries(body)) {
    if (CAMPOS_SENSIBLES.includes(key.toLowerCase())) {
      sanitizado[key] = '[OMITIDO]'
    } else {
      // Solo guardar IDs y campos cortos, no textos largos
      sanitizado[key] = typeof value === 'string' && value.length > 100
        ? value.substring(0, 50) + '...'
        : value
    }
  }
  return sanitizado
}

const logger = (accion) => async (req, res, next) => {
  const originalJson = res.json.bind(res)

  res.json = async (data) => {
    if (res.statusCode < 400 && req.user) {
      try {
        await prisma.log.create({
          data: {
            usuarioId: req.user.id,
            accion,
            detalle: JSON.stringify({
              method: req.method,
              url: req.originalUrl,
              // Fix D: solo IDs relevantes, body sanitizado
              params: req.params,
              body: sanitizarBody(req.body)
            })
          }
        })
      } catch (err) {
        console.error('Error guardando log:', err.message)
      }
    }
    return originalJson(data)
  }

  next()
}

module.exports = logger