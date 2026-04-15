const prisma = require('../prisma/client')

const obtenerLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        skip,
        take: limit,
        include: {
          usuario: { select: { nombre: true, apellido: true, role: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.log.count()
    ])

    res.json({
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

module.exports = { obtenerLogs }