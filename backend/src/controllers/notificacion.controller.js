const prisma = require('../prisma/client')

// Obtener notificaciones del doctor autenticado
const obtenerNotificaciones = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { usuarioId: req.user.id } })
    if (!doctor) return res.status(404).json({ message: 'Doctor no encontrado' })

    const notificaciones = await prisma.notificacion.findMany({
      where: { doctorId: doctor.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const noLeidas = await prisma.notificacion.count({
      where: { doctorId: doctor.id, leida: false }
    })

    res.json({ notificaciones, noLeidas })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Marcar una notificación como leída
const marcarLeida = async (req, res) => {
  try {
    const { id } = req.params
    const doctor = await prisma.doctor.findUnique({ where: { usuarioId: req.user.id } })
    if (!doctor) return res.status(404).json({ message: 'Doctor no encontrado' })

    const notif = await prisma.notificacion.findUnique({ where: { id: parseInt(id) } })
    if (!notif || notif.doctorId !== doctor.id) {
      return res.status(403).json({ message: 'No tienes acceso a esta notificación' })
    }

    await prisma.notificacion.update({
      where: { id: parseInt(id) },
      data: { leida: true }
    })

    res.json({ message: 'Notificación marcada como leída' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Marcar todas como leídas
const marcarTodasLeidas = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { usuarioId: req.user.id } })
    if (!doctor) return res.status(404).json({ message: 'Doctor no encontrado' })

    await prisma.notificacion.updateMany({
      where: { doctorId: doctor.id, leida: false },
      data: { leida: true }
    })

    res.json({ message: 'Todas las notificaciones marcadas como leídas' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Notificaciones del paciente autenticado
const obtenerNotificacionesPaciente = async (req, res) => {
  try {
    const paciente = await prisma.paciente.findUnique({ where: { usuarioId: req.user.id } })
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' })

    const notificaciones = await prisma.notificacion.findMany({
      where: { pacienteId: paciente.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    const noLeidas = await prisma.notificacion.count({
      where: { pacienteId: paciente.id, leida: false }
    })
    res.json({ notificaciones, noLeidas })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const marcarLeidaPaciente = async (req, res) => {
  try {
    const { id } = req.params
    const paciente = await prisma.paciente.findUnique({ where: { usuarioId: req.user.id } })
    const notif = await prisma.notificacion.findUnique({ where: { id: parseInt(id) } })
    if (!notif || notif.pacienteId !== paciente.id) return res.status(403).json({ message: 'Sin acceso' })
    await prisma.notificacion.update({ where: { id: parseInt(id) }, data: { leida: true } })
    res.json({ message: 'Marcada como leída' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const marcarTodasLeidasPaciente = async (req, res) => {
  try {
    const paciente = await prisma.paciente.findUnique({ where: { usuarioId: req.user.id } })
    await prisma.notificacion.updateMany({
      where: { pacienteId: paciente.id, leida: false },
      data: { leida: true }
    })
    res.json({ message: 'Todas marcadas como leídas' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

module.exports = { obtenerNotificaciones, marcarLeida, marcarTodasLeidas, obtenerNotificacionesPaciente, marcarLeidaPaciente, marcarTodasLeidasPaciente }