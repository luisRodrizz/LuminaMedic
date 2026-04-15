const prisma = require('../prisma/client')
const logger = require('../utils/logger')
const { enviarEmailCambioEstado } = require('../services/email.service')

// Obtener bloqueos de un doctor
const obtenerBloqueos = async (req, res) => {
  try {
    const { doctorId } = req.params
    const bloqueos = await prisma.bloqueoHorario.findMany({
      where: { doctorId: parseInt(doctorId) },
      orderBy: { fechaInicio: 'asc' }
    })
    res.json(bloqueos)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Obtener bloqueos del doctor autenticado
const obtenerMisBloqueos = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { usuarioId: req.user.id } })
    if (!doctor) return res.status(404).json({ message: 'Doctor no encontrado' })

    const bloqueos = await prisma.bloqueoHorario.findMany({
      where: { doctorId: doctor.id },
      orderBy: { fechaInicio: 'asc' }
    })
    res.json(bloqueos)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Crear bloqueo
const crearBloqueo = async (req, res) => {
  try {
    const { doctorId, fechaInicio, fechaFin, motivo, cancelarCitasAfectadas } = req.body

    if (!doctorId || !fechaInicio || !fechaFin) {
      return res.status(400).json({ message: 'doctorId, fechaInicio y fechaFin son requeridos' })
    }

    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)

    if (inicio > fin) {
      return res.status(400).json({ message: 'La fecha de inicio debe ser anterior a la fecha de fin' })
    }

    if (inicio < new Date()) {
      return res.status(400).json({ message: 'La fecha de inicio debe ser futura' })
    }

    const solapado = await prisma.bloqueoHorario.findFirst({
      where: {
        doctorId: parseInt(doctorId),
        AND: [
          { fechaInicio: { lte: fin } },
          { fechaFin:    { gte: inicio } }
        ]
      }
    })
    if (solapado) {
      return res.status(400).json({ message: 'Ya existe un bloqueo en ese rango de fechas' })
    }

    // Buscar citas afectadas
    const citasAfectadas = await prisma.cita.findMany({
      where: {
        doctorId: parseInt(doctorId),
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
        fecha: { gte: inicio, lte: fin }
      },
      include: {
        paciente: { include: { usuario: true } },
        servicio: true
      }
    })

    // Crear el bloqueo
    const bloqueo = await prisma.bloqueoHorario.create({
      data: {
        doctorId: parseInt(doctorId),
        fechaInicio: inicio,
        fechaFin: fin,
        motivo: motivo || null
      }
    })

    // Si el admin eligió cancelar las citas afectadas
    if (cancelarCitasAfectadas && citasAfectadas.length > 0) {
      for (const cita of citasAfectadas) {
        await prisma.cita.update({
          where: { id: cita.id },
          data: { estado: 'CANCELADA' }
        })

        // Notificación al paciente
        await prisma.notificacion.create({
          data: {
            pacienteId: cita.pacienteId,
            titulo: 'Cita cancelada por el médico',
            mensaje: `Tu cita de ${cita.servicio.nombre} del ${new Date(cita.fecha).toLocaleDateString('es-PE')} fue cancelada porque el doctor no estará disponible${motivo ? ` — ${motivo}` : ''}.`,
            tipo: 'CANCELACION',
            citaId: cita.id
          }
        })

        // Email al paciente
        enviarEmailCambioEstado({
          pacienteEmail:  cita.paciente.usuario.email,
          pacienteNombre: `${cita.paciente.usuario.nombre} ${cita.paciente.usuario.apellido}`,
          estado: 'CANCELADA',
          servicio: cita.servicio.nombre,
          fecha: cita.fecha
        }).catch(err => logger.error('Error enviando email cancelación por bloqueo', { error: err.message }))
      }
    }

    res.status(201).json({
      message: 'Bloqueo creado correctamente',
      bloqueo,
      citasAfectadas: citasAfectadas.length,
      citasCanceladas: cancelarCitasAfectadas ? citasAfectadas.length : 0,
      advertencia: citasAfectadas.length > 0 && !cancelarCitasAfectadas
        ? `Hay ${citasAfectadas.length} cita(s) confirmada(s) en este período que no fueron canceladas.`
        : null
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Eliminar bloqueo
const eliminarBloqueo = async (req, res) => {
  try {
    const { id } = req.params
    const bloqueo = await prisma.bloqueoHorario.findUnique({ where: { id: parseInt(id) } })
    if (!bloqueo) return res.status(404).json({ message: 'Bloqueo no encontrado' })

    await prisma.bloqueoHorario.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Bloqueo eliminado correctamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

module.exports = { obtenerBloqueos, obtenerMisBloqueos, crearBloqueo, eliminarBloqueo }