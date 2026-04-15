const prisma = require('../prisma/client')
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const logger = require('../utils/logger')
const { enviarEmailCambioEstado } = require('../services/email.service')

// Obtener horarios de un doctor específico
const obtenerHorarios = async (req, res) => {
  try {
    const { doctorId } = req.params
    const horarios = await prisma.horario.findMany({
      where: { doctorId: parseInt(doctorId) },
      orderBy: { diaSemana: 'asc' }
    })
    res.json(horarios)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Obtener horarios del doctor autenticado
const obtenerMisHorarios = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { usuarioId: req.user.id } })
    if (!doctor) return res.status(404).json({ message: 'Doctor no encontrado' })

    const horarios = await prisma.horario.findMany({
      where: { doctorId: doctor.id },
      orderBy: { diaSemana: 'asc' }
    })
    res.json(horarios)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Crear horario
const crearHorario = async (req, res) => {
  try {
    const { doctorId, diaSemana, horaInicio, horaFin } = req.body

    if (diaSemana < 0 || diaSemana > 6) {
      return res.status(400).json({ message: 'Día de semana inválido (0=Lunes, 6=Domingo)' })
    }
    if (horaInicio >= horaFin) {
      return res.status(400).json({ message: 'La hora de inicio debe ser menor a la hora de fin' })
    }

    // Verificar que no exista ya un horario para ese día
    const existente = await prisma.horario.findFirst({
      where: { doctorId: parseInt(doctorId), diaSemana: parseInt(diaSemana) }
    })
    if (existente) {
      return res.status(400).json({ message: `Ya existe un horario para el ${DIAS[diaSemana]}` })
    }

    const horario = await prisma.horario.create({
      data: {
        doctorId:   parseInt(doctorId),
        diaSemana:  parseInt(diaSemana),
        horaInicio,
        horaFin,
        activo: true
      }
    })
    res.status(201).json({ message: 'Horario creado correctamente', horario })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Actualizar horario
const actualizarHorario = async (req, res) => {
  try {
    const { id } = req.params
    const { horaInicio, horaFin, activo } = req.body

    if (horaInicio && horaFin && horaInicio >= horaFin) {
      return res.status(400).json({ message: 'La hora de inicio debe ser menor a la hora de fin' })
    }

    const horario = await prisma.horario.update({
      where: { id: parseInt(id) },
      data: { horaInicio, horaFin, activo }
    })
    res.json({ message: 'Horario actualizado correctamente', horario })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Eliminar horario
const eliminarHorario = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.horario.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Horario eliminado correctamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Obtener slots disponibles para agendar (usado por paciente)
const obtenerSlotsDisponibles = async (req, res) => {
  try {
    const { doctorId, fecha, duracion } = req.query
    if (!doctorId || !fecha || !duracion) {
      return res.status(400).json({ message: 'doctorId, fecha y duracion son requeridos' })
    }
 
    const [anio, mes, dia] = fecha.split('-').map(Number)
    const fechaDate = new Date(anio, mes - 1, dia)
 
    // Verificar si el día está bloqueado
    const inicioDia = new Date(anio, mes - 1, dia, 0, 0, 0)
    const finDia    = new Date(anio, mes - 1, dia, 23, 59, 59)
 
    const bloqueo = await prisma.bloqueoHorario.findFirst({
      where: {
        doctorId: parseInt(doctorId),
        fechaInicio: { lte: finDia },
        fechaFin:    { gte: inicioDia }
      }
    })
 
    if (bloqueo) {
      return res.json({
        slots: [],
        bloqueado: true,
        motivo: bloqueo.motivo || 'El doctor no está disponible este día'
      })
    }
 
    // JS: 0=Dom, 1=Lun... → sistema: 0=Lun, 1=Mar...
    const diaSemanaJS = fechaDate.getDay()
    const diaSemana = diaSemanaJS === 0 ? 6 : diaSemanaJS - 1
 
    const horario = await prisma.horario.findFirst({
      where: { doctorId: parseInt(doctorId), diaSemana, activo: true }
    })
    if (!horario) return res.json({ slots: [], bloqueado: false })
 
    const citasOcupadas = await prisma.cita.findMany({
      where: {
        doctorId: parseInt(doctorId),
        fecha: { gte: inicioDia, lte: finDia },
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] }
      },
      include: { servicio: { select: { duracion: true } } }
    })
 
    const ahora = new Date()
    const esHoy = ahora.getFullYear() === anio && (ahora.getMonth() + 1) === mes && ahora.getDate() === dia
    const minutoActual = esHoy ? ahora.getHours() * 60 + ahora.getMinutes() : -1
 
    const slots = []
    const [hIni, mIni] = horario.horaInicio.split(':').map(Number)
    const [hFin, mFin] = horario.horaFin.split(':').map(Number)
    const durMin = parseInt(duracion)
 
    let actual = hIni * 60 + mIni
    const fin = hFin * 60 + mFin
 
    while (actual + durMin <= fin) {
      if (esHoy && actual <= minutoActual) {
        actual += durMin
        continue
      }
 
      const h = String(Math.floor(actual / 60)).padStart(2, '0')
      const m = String(actual % 60).padStart(2, '0')
      const hora = `${h}:${m}`
 
      const ocupado = citasOcupadas.some(cita => {
        const citaInicio = new Date(cita.fecha).getHours() * 60 + new Date(cita.fecha).getMinutes()
        const citaFin = citaInicio + (cita.servicio?.duracion || durMin)
        return actual < citaFin && (actual + durMin) > citaInicio
      })
 
      slots.push({ hora, ocupado })
      actual += durMin
    }
 
    res.json({ slots, bloqueado: false })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

module.exports = {
  obtenerHorarios, obtenerMisHorarios,
  crearHorario, actualizarHorario, eliminarHorario,
  obtenerSlotsDisponibles
}