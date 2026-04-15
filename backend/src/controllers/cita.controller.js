const prisma = require('../prisma/client')
const logger = require('../utils/logger')
const { enviarEmailCitaCreada, enviarEmailCambioEstado } = require('../services/email.service')

// ─────────────────────────────────────────────────────────────
// Helper: verifica horario activo del doctor + bloqueos
// Retorna null si es válido, o string con el mensaje de error
// ─────────────────────────────────────────────────────────────
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const MAX_CITAS_ACTIVAS = 5

const validarHorarioDoctor = async (doctorId, fechaCita, duracionMin) => {
  const inicioDia = new Date(fechaCita.getFullYear(), fechaCita.getMonth(), fechaCita.getDate(), 0, 0, 0)
  const finDia    = new Date(fechaCita.getFullYear(), fechaCita.getMonth(), fechaCita.getDate(), 23, 59, 59)

  // 1. Verificar bloqueo de vacaciones
  const bloqueo = await prisma.bloqueoHorario.findFirst({
    where: {
      doctorId,
      fechaInicio: { lte: finDia },
      fechaFin:    { gte: inicioDia }
    }
  })

  if (bloqueo) {
    return `El doctor no está disponible en esa fecha${bloqueo.motivo ? ` — ${bloqueo.motivo}` : ''}. Por favor selecciona otra fecha.`
  }

  // 2. Obtener día de semana del sistema (0=Lun, 6=Dom)
  const diaSemanaJS = fechaCita.getDay()             // JS: 0=Dom, 1=Lun...
  const diaSemana   = diaSemanaJS === 0 ? 6 : diaSemanaJS - 1

  const horario = await prisma.horario.findFirst({
    where: { doctorId, diaSemana, activo: true }
  })

  if (!horario) {
    return `El doctor no atiende los ${DIAS[diaSemana]}`
  }

  // 3. Verificar que la hora de la cita esté dentro del rango del horario
  const [hIni, mIni] = horario.horaInicio.split(':').map(Number)
  const [hFin, mFin] = horario.horaFin.split(':').map(Number)

  const inicioHorario = hIni * 60 + mIni
  const finHorario    = hFin * 60 + mFin

  const horaCita   = fechaCita.getHours() * 60 + fechaCita.getMinutes()
  const finCitaMin = horaCita + duracionMin

  if (horaCita < inicioHorario || finCitaMin > finHorario) {
    return `El doctor atiende de ${horario.horaInicio} a ${horario.horaFin}. La cita no cabe en ese horario.`
  }

  return null // ✅ válido
}

const crearCita = async (req, res) => {
  try {
    const { fecha, motivo, doctorId, servicioId } = req.body
    let pacienteId

    // pacienteId según rol
    if (req.user.role === 'PACIENTE') {
      const paciente = await prisma.paciente.findUnique({
        where: { usuarioId: req.user.id }
      })
      if (!paciente) return res.status(404).json({ message: 'Perfil de paciente no encontrado' })
      pacienteId = paciente.id
    } else if (req.user.role === 'ADMIN') {
      if (!req.body.pacienteId) return res.status(400).json({ message: 'pacienteId requerido' })
      pacienteId = parseInt(req.body.pacienteId)
    } else {
      return res.status(403).json({ message: 'No tienes permisos para crear citas' })
    }

    // ── NUEVO: Verificar límite de citas activas por paciente ──
    const citasActivas = await prisma.cita.count({
      where: {
        pacienteId,
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] }
      }
    })
    if (citasActivas >= MAX_CITAS_ACTIVAS) {
      return res.status(400).json({
        message: `El paciente ya tiene ${MAX_CITAS_ACTIVAS} citas activas. Debe cancelar o completar una antes de agendar otra.`
      })
    }
    // ──────────────────────────────────────────────────────────

    // Validar servicio
    const servicio = await prisma.servicio.findUnique({ where: { id: parseInt(servicioId) } })
    if (!servicio || !servicio.activo) {
      return res.status(400).json({ message: 'Servicio no disponible' })
    }

    // Validar doctor
    const doctor = await prisma.doctor.findUnique({ where: { id: parseInt(doctorId) } })
    if (!doctor) return res.status(400).json({ message: 'Doctor no encontrado' })

    const fechaCita = new Date(fecha)

    // Validar horario del doctor (incluye bloqueos de vacaciones)
    const errorHorario = await validarHorarioDoctor(parseInt(doctorId), fechaCita, servicio.duracion)
    if (errorHorario) return res.status(400).json({ message: errorHorario })

    // Verificar solapamiento con otras citas
    const finCita = new Date(fechaCita.getTime() + servicio.duracion * 60 * 1000)

    const citasSolapadas = await prisma.cita.findFirst({
      where: {
        doctorId: parseInt(doctorId),
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
        AND: [
          { fecha: { lt: finCita } },
          { fecha: { gte: new Date(fechaCita.getTime() - 24 * 60 * 60 * 1000) } }
        ]
      },
      include: { servicio: true }
    })

    if (citasSolapadas) {
      const finExistente = new Date(
        citasSolapadas.fecha.getTime() + citasSolapadas.servicio.duracion * 60 * 1000
      )
      if (citasSolapadas.fecha < finCita && finExistente > fechaCita) {
        return res.status(400).json({
          message: `El doctor ya tiene una cita a las ${citasSolapadas.fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} que dura ${citasSolapadas.servicio.duracion} minutos`
        })
      }
    }

    // Crear cita
    const cita = await prisma.cita.create({
      data: {
        fecha: fechaCita,
        motivo,
        doctorId: parseInt(doctorId),
        pacienteId,
        servicioId: parseInt(servicioId)
      },
      include: {
        doctor: { include: { usuario: true } },
        paciente: { include: { usuario: true } },
        servicio: true
      }
    })

    // Notificación al doctor
    await prisma.notificacion.create({
      data: {
        doctorId: parseInt(doctorId),
        titulo: 'Nueva cita confirmada',
        mensaje: `${cita.paciente.usuario.nombre} ${cita.paciente.usuario.apellido} agendó ${cita.servicio.nombre} para el ${cita.fecha.toLocaleDateString('es-PE')}`,
        tipo: 'NUEVA_CITA',
        citaId: cita.id
      }
    })

    // Notificación al paciente
    await prisma.notificacion.create({
      data: {
        pacienteId,
        titulo: 'Cita confirmada',
        mensaje: `Tu cita de ${cita.servicio.nombre} con el Dr. ${cita.doctor.usuario.nombre} ${cita.doctor.usuario.apellido} para el ${cita.fecha.toLocaleDateString('es-PE')} está confirmada`,
        tipo: 'CONFIRMACION',
        citaId: cita.id
      }
    })

    enviarEmailCitaCreada({
      pacienteEmail: cita.paciente.usuario.email,
      pacienteNombre: `${cita.paciente.usuario.nombre} ${cita.paciente.usuario.apellido}`,
      doctorNombre: `${cita.doctor.usuario.nombre} ${cita.doctor.usuario.apellido}`,
      servicio: cita.servicio.nombre,
      fecha: cita.fecha
    }).catch(err => logger.error('Error enviando email cita creada', { error: err.message }))

    res.status(201).json({ message: 'Cita creada correctamente', cita })
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        message: 'Ya existe una cita para ese doctor en ese horario. Por favor selecciona otro horario.'
      })
    }
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const obtenerCitas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const estado = req.query.estado || undefined
    const inicio = req.query.inicio || undefined
    const fin    = req.query.fin    || undefined

    let where = {}
    if (estado) where.estado = estado

    if (inicio && fin) {
      const [anioI, mesI, diaI] = inicio.split('-').map(Number)
      const [anioF, mesF, diaF] = fin.split('-').map(Number)
      where.fecha = {
        gte: new Date(anioI, mesI - 1, diaI, 0, 0, 0),
        lte: new Date(anioF, mesF - 1, diaF, 23, 59, 59)
      }
    }

    if (req.user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { usuarioId: req.user.id } })
      if (!doctor) return res.status(404).json({ message: 'Perfil de doctor no encontrado' })
      where.doctorId = doctor.id
    }

    if (req.user.role === 'PACIENTE') {
      const paciente = await prisma.paciente.findUnique({ where: { usuarioId: req.user.id } })
      if (!paciente) return res.status(404).json({ message: 'Perfil de paciente no encontrado' })
      where.pacienteId = paciente.id
    }

    const [citas, total] = await Promise.all([
      prisma.cita.findMany({
        where,
        skip,
        take: limit,
        include: {
          doctor: {
            include: {
              usuario: { select: { nombre: true, apellido: true, email: true, telefono: true } }
            }
          },
          paciente: {
            include: {
              usuario: { select: { nombre: true, apellido: true, email: true, telefono: true } }
            }
          },
          servicio: true,
          nota: true
        },
        orderBy: { fecha: 'asc' }
      }),
      prisma.cita.count({ where })
    ])

    res.json({
      data: citas,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const obtenerCita = async (req, res) => {
  try {
    const { id } = req.params
    const cita = await prisma.cita.findUnique({
      where: { id: parseInt(id) },
      include: {
        doctor: { include: { usuario: { select: { nombre: true, apellido: true, email: true, telefono: true } } } },
        paciente: { include: { usuario: { select: { nombre: true, apellido: true, email: true, telefono: true } } } },
        servicio: true,
        nota: true,
        pago: true
      }
    })
    if (!cita) return res.status(404).json({ message: 'Cita no encontrada' })

    if (req.user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { usuarioId: req.user.id } })
      if (!doctor || cita.doctorId !== doctor.id) {
        return res.status(403).json({ message: 'No tienes acceso a esta cita' })
      }
    }

    if (req.user.role === 'PACIENTE') {
      const paciente = await prisma.paciente.findUnique({ where: { usuarioId: req.user.id } })
      if (!paciente || cita.pacienteId !== paciente.id) {
        return res.status(403).json({ message: 'No tienes acceso a esta cita' })
      }
    }

    res.json(cita)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const actualizarEstadoCita = async (req, res) => {
  try {
    const { id } = req.params
    const { estado } = req.body

    const estadosValidos = ['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA']
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' })
    }

    const citaExiste = await prisma.cita.findUnique({ where: { id: parseInt(id) } })
    if (!citaExiste) return res.status(404).json({ message: 'Cita no encontrada' })

    if (req.user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { usuarioId: req.user.id } })
      if (!doctor || citaExiste.doctorId !== doctor.id) {
        return res.status(403).json({ message: 'No tienes acceso a esta cita' })
      }
    }

    const cita = await prisma.cita.update({
      where: { id: parseInt(id) },
      data: { estado },
      include: {
        paciente: { include: { usuario: true } },
        servicio: true
      }
    })

    if (['CONFIRMADA', 'COMPLETADA', 'CANCELADA'].includes(estado)) {
      await prisma.notificacion.create({
        data: {
          pacienteId: cita.pacienteId,
          titulo: estado === 'CONFIRMADA' ? 'Cita confirmada' :
                  estado === 'COMPLETADA' ? 'Consulta completada' : 'Cita cancelada',
          mensaje: `Tu cita de ${cita.servicio.nombre} del ${new Date(cita.fecha).toLocaleDateString('es-PE')} fue ${estado.toLowerCase()}`,
          tipo: estado === 'CONFIRMADA' ? 'CONFIRMACION' :
                estado === 'COMPLETADA' ? 'COMPLETADA' : 'CANCELACION',
          citaId: parseInt(id)
        }
      })
    }

    if (estado === 'CANCELADA') {
      await prisma.notificacion.create({
        data: {
          doctorId: cita.doctorId,
          titulo: 'Cita cancelada',
          mensaje: `La cita del ${new Date(cita.fecha).toLocaleDateString('es-PE')} fue cancelada`,
          tipo: 'CANCELACION',
          citaId: parseInt(id)
        }
      })
    }

    enviarEmailCambioEstado({
      pacienteEmail: cita.paciente.usuario.email,
      pacienteNombre: `${cita.paciente.usuario.nombre} ${cita.paciente.usuario.apellido}`,
      estado: cita.estado,
      servicio: cita.servicio.nombre,
      fecha: cita.fecha
    }).catch(err => logger.error('Error enviando email cambio estado', { error: err.message }))

    res.json({ message: 'Estado actualizado correctamente', cita })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const agregarNotaClinica = async (req, res) => {
  try {
    const { id } = req.params
    const { diagnostico, tratamiento, receta, observacion } = req.body

    if (!diagnostico) return res.status(400).json({ message: 'El diagnóstico es requerido' })

    const citaExiste = await prisma.cita.findUnique({
      where: { id: parseInt(id) },
      include: { servicio: true }
    })
    if (!citaExiste) return res.status(404).json({ message: 'Cita no encontrada' })

    if (req.user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { usuarioId: req.user.id } })
      if (!doctor || citaExiste.doctorId !== doctor.id) return res.status(403).json({ message: 'No tienes acceso a esta cita' })
    }

    const notaExiste = await prisma.notaClinica.findUnique({ where: { citaId: parseInt(id) } })
    if (notaExiste) return res.status(400).json({ message: 'Esta cita ya tiene una nota clínica' })

    const nota = await prisma.notaClinica.create({
      data: { diagnostico, tratamiento, receta, observacion, citaId: parseInt(id) }
    })

    await prisma.cita.update({ where: { id: parseInt(id) }, data: { estado: 'COMPLETADA' } })

    await prisma.notificacion.create({
      data: {
        pacienteId: citaExiste.pacienteId,
        titulo: 'Consulta completada',
        mensaje: `Tu consulta de ${citaExiste.servicio.nombre} del ${new Date(citaExiste.fecha).toLocaleDateString('es-PE')} fue completada. Ya puedes ver tu nota clínica en el historial.`,
        tipo: 'COMPLETADA',
        citaId: parseInt(id)
      }
    })

    res.status(201).json({ message: 'Nota clínica agregada correctamente', nota })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const cancelarCita = async (req, res) => {
  try {
    const { id } = req.params
    const MAX_CANCELACIONES_MES = 3

    const cita = await prisma.cita.findUnique({ where: { id: parseInt(id) } })
    if (!cita) return res.status(404).json({ message: 'Cita no encontrada' })

    const paciente = await prisma.paciente.findUnique({ where: { usuarioId: req.user.id } })
    if (!paciente || cita.pacienteId !== paciente.id) {
      return res.status(403).json({ message: 'No tienes acceso a esta cita' })
    }

    if (cita.estado === 'COMPLETADA' || cita.estado === 'CANCELADA') {
      return res.status(400).json({ message: 'Esta cita no se puede cancelar' })
    }

    const hoy = new Date()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const finMes    = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59)

    const cancelacionesMes = await prisma.cita.count({
      where: {
        pacienteId: paciente.id,
        estado: 'CANCELADA',
        updatedAt: { gte: inicioMes, lte: finMes }
      }
    })

    if (cancelacionesMes >= MAX_CANCELACIONES_MES) {
      return res.status(429).json({
        message: `Has alcanzado el límite de ${MAX_CANCELACIONES_MES} cancelaciones este mes. Contacta a la clínica para más información.`
      })
    }

    const citaActualizada = await prisma.cita.update({
      where: { id: parseInt(id) },
      data: { estado: 'CANCELADA' },
      include: { paciente: { include: { usuario: true } }, servicio: true }
    })

    await prisma.notificacion.create({
      data: {
        doctorId: cita.doctorId,
        titulo: 'Cita cancelada por paciente',
        mensaje: `${citaActualizada.paciente.usuario.nombre} ${citaActualizada.paciente.usuario.apellido} canceló la cita de ${citaActualizada.servicio.nombre} del ${new Date(cita.fecha).toLocaleDateString('es-PE')}`,
        tipo: 'CANCELACION',
        citaId: parseInt(id)
      }
    })

    await prisma.notificacion.create({
      data: {
        pacienteId: cita.pacienteId,
        titulo: 'Cita cancelada',
        mensaje: `Tu cita de ${citaActualizada.servicio.nombre} del ${new Date(cita.fecha).toLocaleDateString('es-PE')} fue cancelada correctamente. Te quedan ${MAX_CANCELACIONES_MES - cancelacionesMes - 1} cancelaciones disponibles este mes.`,
        tipo: 'CANCELACION',
        citaId: parseInt(id)
      }
    })

    enviarEmailCambioEstado({
      pacienteEmail: citaActualizada.paciente.usuario.email,
      pacienteNombre: `${citaActualizada.paciente.usuario.nombre} ${citaActualizada.paciente.usuario.apellido}`,
      estado: 'CANCELADA',
      servicio: citaActualizada.servicio.nombre,
      fecha: citaActualizada.fecha
    }).catch(err => logger.error('Error enviando email cancelación', { error: err.message }))

    res.json({
      message: 'Cita cancelada correctamente',
      cancelacionesRestantes: MAX_CANCELACIONES_MES - cancelacionesMes - 1
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const citasHoy = async (req, res) => {
  try {
    const hoy = new Date()
    const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0)
    const finDia    = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59)

    const citas = await prisma.cita.findMany({
      where: { fecha: { gte: inicioDia, lte: finDia } },
      include: {
        doctor:   { include: { usuario: { select: { nombre: true, apellido: true } } } },
        paciente: { include: { usuario: { select: { nombre: true, apellido: true } } } },
        servicio: true
      },
      orderBy: { fecha: 'asc' }
    })

    res.json(citas)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const reprogramarCita = async (req, res) => {
  try {
    const { id } = req.params
    const { fecha } = req.body

    if (!fecha) return res.status(400).json({ message: 'La nueva fecha es requerida' })

    const cita = await prisma.cita.findUnique({
      where: { id: parseInt(id) },
      include: { servicio: true, paciente: { include: { usuario: true } }, doctor: { include: { usuario: true } } }
    })
    if (!cita) return res.status(404).json({ message: 'Cita no encontrada' })

    const paciente = await prisma.paciente.findUnique({ where: { usuarioId: req.user.id } })
    if (!paciente || cita.pacienteId !== paciente.id) {
      return res.status(403).json({ message: 'No tienes acceso a esta cita' })
    }

    if (cita.estado !== 'CONFIRMADA' && cita.estado !== 'PENDIENTE') {
      return res.status(400).json({ message: 'Solo puedes reprogramar citas pendientes o confirmadas' })
    }

    const nuevaFecha = new Date(fecha)
    if (nuevaFecha <= new Date()) {
      return res.status(400).json({ message: 'La nueva fecha debe ser futura' })
    }

    // ── NUEVO: Validar horario del doctor (reemplaza el bloque de bloqueo anterior) ──
    const errorHorario = await validarHorarioDoctor(cita.doctorId, nuevaFecha, cita.servicio.duracion)
    if (errorHorario) return res.status(400).json({ message: errorHorario })
    // ─────────────────────────────────────────────────────────────────────────────────

    // Verificar solapamiento — excluir la cita actual
    const finCita = new Date(nuevaFecha.getTime() + cita.servicio.duracion * 60 * 1000)

    const citasSolapadas = await prisma.cita.findFirst({
      where: {
        doctorId: cita.doctorId,
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
        id: { not: parseInt(id) },
        AND: [
          { fecha: { lt: finCita } },
          { fecha: { gte: new Date(nuevaFecha.getTime() - 24 * 60 * 60 * 1000) } }
        ]
      },
      include: { servicio: true }
    })

    if (citasSolapadas) {
      const finExistente = new Date(citasSolapadas.fecha.getTime() + citasSolapadas.servicio.duracion * 60 * 1000)
      if (citasSolapadas.fecha < finCita && finExistente > nuevaFecha) {
        return res.status(400).json({
          message: `El doctor ya tiene una cita a las ${citasSolapadas.fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} que dura ${citasSolapadas.servicio.duracion} minutos`
        })
      }
    }

    const fechaAnterior = cita.fecha

    const citaActualizada = await prisma.cita.update({
      where: { id: parseInt(id) },
      data: { fecha: nuevaFecha },
      include: { servicio: true, paciente: { include: { usuario: true } }, doctor: { include: { usuario: true } } }
    })

    await prisma.notificacion.create({
      data: {
        doctorId: cita.doctorId,
        titulo: 'Cita reprogramada',
        mensaje: `${cita.paciente.usuario.nombre} ${cita.paciente.usuario.apellido} reprogramó su cita de ${cita.servicio.nombre} del ${fechaAnterior.toLocaleDateString('es-PE')} al ${nuevaFecha.toLocaleDateString('es-PE')}`,
        tipo: 'CAMBIO_ESTADO',
        citaId: parseInt(id)
      }
    })

    await prisma.notificacion.create({
      data: {
        pacienteId: cita.pacienteId,
        titulo: 'Cita reprogramada',
        mensaje: `Tu cita de ${cita.servicio.nombre} fue reprogramada para el ${nuevaFecha.toLocaleDateString('es-PE')}`,
        tipo: 'CAMBIO_ESTADO',
        citaId: parseInt(id)
      }
    })

    enviarEmailCambioEstado({
      pacienteEmail: cita.paciente.usuario.email,
      pacienteNombre: `${cita.paciente.usuario.nombre} ${cita.paciente.usuario.apellido}`,
      estado: 'REPROGRAMADA',
      servicio: cita.servicio.nombre,
      fecha: nuevaFecha
    }).catch(err => logger.error('Error enviando email de reprogramación', { error: err.message }))

    res.json({ message: 'Cita reprogramada correctamente', cita: citaActualizada })
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        message: 'Ya existe una cita para ese doctor en ese horario. Por favor selecciona otro horario.'
      })
    }
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

module.exports = { crearCita, obtenerCitas, obtenerCita, actualizarEstadoCita, agregarNotaClinica, cancelarCita, citasHoy, reprogramarCita }