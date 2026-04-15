const jwt = require('jsonwebtoken')
const prisma = require('../prisma/client')
const redis = require('../utils/redis')

const CACHE_TTL = 300 // 5 minutos en segundos

const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 1. Buscar en caché Redis primero
    const cacheKey = `user:${decoded.id}`
    const cached = await redis.get(cacheKey)

    if (cached) {
      const usuario = JSON.parse(cached)
      // Si está cacheado como inactivo, bloquear
      if (!usuario.activo) {
        return res.status(403).json({ message: 'Tu cuenta está desactivada' })
      }
      req.user = { id: usuario.id, email: usuario.email, role: usuario.role }
      return next()
    }

    // 2. No está en caché — consultar PostgreSQL
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, activo: true }
    })

    if (!usuario || !usuario.activo) {
      return res.status(403).json({ message: 'Tu cuenta está desactivada' })
    }

    // 3. Guardar en caché por 5 minutos
    await redis.set(cacheKey, JSON.stringify(usuario), 'EX', CACHE_TTL)

    req.user = { id: usuario.id, email: usuario.email, role: usuario.role }
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' })
  }
}

const verifyRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permisos' })
    }
    next()
  }
}

// Invalidar caché de un usuario — llamar cuando se desactiva
const invalidarCacheUsuario = async (usuarioId) => {
  try {
    await redis.del(`user:${usuarioId}`)
  } catch (err) {
    const logger = require('../utils/logger')
    logger.error(`Error invalidando caché usuario ${usuarioId}: ${err.message}`)
  }
}

module.exports = { verifyToken, verifyRole, invalidarCacheUsuario }