const prisma = require('../prisma/client')

// ─── Estadísticas Admin ───────────────────────────────────────────────────────
const getEstadisticas = async (req, res) => {
  try {
    const hoy = new Date()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const inicioAno = new Date(hoy.getFullYear(), 0, 1)
    const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0)
    const finDia    = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59)

    const [
      totalDoctores, totalPacientes, totalCitas, totalServicios,
      citasMes, citasPorEstado, citasPorMes, ingresosMes
    ] = await Promise.all([
      prisma.doctor.count(),
      prisma.paciente.count(),
      prisma.cita.count(),
      prisma.servicio.count({ where: { activo: true } }),

      // ← Ahora usa fecha real de la cita, no createdAt
      prisma.cita.count({ where: { fecha: { gte: inicioMes } } }),

      prisma.cita.groupBy({ by: ['estado'], _count: { estado: true } }),

      // ← Ahora usa fecha real de la cita, no createdAt
      prisma.cita.findMany({
        where: { fecha: { gte: inicioAno } },
        select: { fecha: true }
      }),

      prisma.pago.aggregate({
        _sum: { monto: true },
        where: { createdAt: { gte: inicioMes } }
      }),
    ])

    // Agrupar citas por mes usando fecha real
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const citasMensuales = meses.map((mes, i) => ({
      mes,
      citas: citasPorMes.filter(c => new Date(c.fecha).getMonth() === i).length
    }))

    res.json({
      totales: {
        doctores: totalDoctores, pacientes: totalPacientes,
        citas: totalCitas, servicios: totalServicios,
        citasMes, ingresosMes: ingresosMes._sum.monto || 0
      },
      citasPorEstado: citasPorEstado.map(c => ({ estado: c.estado, total: c._count.estado })),
      citasMensuales,
    })
  } catch (error) {
    console.error('ERROR getEstadisticas:', error)
    res.status(500).json({
      message: 'Error en el servidor',
      error: error.message
    })
  }
}

// ─── Estadísticas Doctor autenticado ─────────────────────────────────────────
const getEstadisticasDoctor = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { usuarioId: req.user.id } })
    if (!doctor) return res.status(404).json({ message: 'Doctor no encontrado' })

    const hoy = new Date()
    const inicioDia  = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0)
    const finDia     = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59)
    const inicioMes  = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const finMes     = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59)
    const inicioAno  = new Date(hoy.getFullYear(), 0, 1)

    const [
      // Totales generales
      totalCitas,
      citasPorEstado,
      // Mes actual
      citasMes,
      completadasMes,
      canceladasMes,
      ingresosMes,
      // Hoy
      citasHoy,
      // Año — para gráfico mensual
      citasAno,
      pagosAno,
      // Pacientes únicos
      pacientesUnicos,
      // Próximas citas
      proximasCitas,
    ] = await Promise.all([
      // Total histórico de citas
      prisma.cita.count({ where: { doctorId: doctor.id } }),

      // Conteo por estado (histórico)
      prisma.cita.groupBy({
        by: ['estado'],
        where: { doctorId: doctor.id },
        _count: { estado: true }
      }),

      // Citas este mes
      prisma.cita.count({
        where: { doctorId: doctor.id, fecha: { gte: inicioMes, lte: finMes } }
      }),

      // Completadas este mes
      prisma.cita.count({
        where: { doctorId: doctor.id, estado: 'COMPLETADA', fecha: { gte: inicioMes, lte: finMes } }
      }),

      // Canceladas este mes
      prisma.cita.count({
        where: { doctorId: doctor.id, estado: 'CANCELADA', fecha: { gte: inicioMes, lte: finMes } }
      }),

      // Ingresos este mes (pagos de sus citas)
      prisma.pago.aggregate({
        _sum: { monto: true },
        where: {
          createdAt: { gte: inicioMes, lte: finMes },
          cita: { doctorId: doctor.id }
        }
      }),

      // Citas de hoy
      prisma.cita.findMany({
        where: {
          doctorId: doctor.id,
          fecha: { gte: inicioDia, lte: finDia },
          estado: { not: 'CANCELADA' }
        },
        include: {
          paciente: { include: { usuario: { select: { nombre: true, apellido: true } } } },
          servicio: true
        },
        orderBy: { fecha: 'asc' }
      }),

      // Citas por mes este año (para gráfico)
      prisma.cita.findMany({
        where: { doctorId: doctor.id, fecha: { gte: inicioAno } },
        select: { fecha: true, estado: true }
      }),

      // Pagos por mes este año
      prisma.pago.findMany({
        where: {
          createdAt: { gte: inicioAno },
          cita: { doctorId: doctor.id }
        },
        select: { monto: true, createdAt: true }
      }),

      // Pacientes únicos atendidos
      prisma.cita.findMany({
        where: { doctorId: doctor.id, estado: 'COMPLETADA' },
        select: { pacienteId: true },
        distinct: ['pacienteId']
      }),

      // Próximas citas (sin límite frontend)
      prisma.cita.findMany({
        where: {
          doctorId: doctor.id,
          fecha: { gt: finDia },
          estado: { in: ['PENDIENTE', 'CONFIRMADA'] }
        },
        include: {
          paciente: { include: { usuario: { select: { nombre: true, apellido: true } } } },
          servicio: true
        },
        orderBy: { fecha: 'asc' },
        take: 5
      }),
    ])

    // Gráfico mensual — citas y pagos por mes
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const graficoMensual = meses.map((mes, i) => ({
      mes,
      citas:    citasAno.filter(c => new Date(c.fecha).getMonth() === i).length,
      completadas: citasAno.filter(c => new Date(c.fecha).getMonth() === i && c.estado === 'COMPLETADA').length,
      ingresos: pagosAno
        .filter(p => new Date(p.createdAt).getMonth() === i)
        .reduce((acc, p) => acc + p.monto, 0)
    }))

    // Tasa de asistencia (completadas / total no canceladas * 100)
    const totalNoCanceladas = citasPorEstado
      .filter(c => c.estado !== 'CANCELADA')
      .reduce((acc, c) => acc + c._count.estado, 0)
    const totalCompletadas = citasPorEstado.find(c => c.estado === 'COMPLETADA')?._count.estado || 0
    const tasaAsistencia = totalNoCanceladas > 0
      ? Math.round((totalCompletadas / totalNoCanceladas) * 100)
      : 0

    res.json({
      resumen: {
        totalCitas,
        totalCompletadas,
        totalCanceladas: citasPorEstado.find(c => c.estado === 'CANCELADA')?._count.estado || 0,
        totalPendientes: citasPorEstado.find(c => c.estado === 'PENDIENTE')?._count.estado || 0,
        pacientesUnicos: pacientesUnicos.length,
        tasaAsistencia,
        ingresosMes:     ingresosMes._sum.monto || 0,
      },
      mes: {
        total:      citasMes,
        completadas: completadasMes,
        canceladas:  canceladasMes,
        pendientes:  citasMes - completadasMes - canceladasMes,
      },
      citasHoy,
      proximasCitas,
      graficoMensual,
      citasPorEstado: citasPorEstado.map(c => ({ estado: c.estado, total: c._count.estado }))
    })
  } catch (error) {
    console.error('ERROR getEstadisticasDoctor:', error)
    res.status(500).json({
      message: 'Error en el servidor',
      error: error.message
    })
  }
}

// ─── Estadísticas Paciente autenticado ───────────────────────────────────────
const getEstadisticasPaciente = async (req, res) => {
  try {
    const paciente = await prisma.paciente.findUnique({ where: { usuarioId: req.user.id } })
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' })

    const hoy = new Date()
    const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0)
    const finDia    = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59)
    const inicioAno = new Date(hoy.getFullYear(), 0, 1)

    const [
      totalCitas,
      citasPorEstado,
      proximasCitas,
      citasAno,
      doctoresUnicos,
      ultimasCompletadas,
    ] = await Promise.all([
      // Total histórico
      prisma.cita.count({ where: { pacienteId: paciente.id } }),

      // Por estado
      prisma.cita.groupBy({
        by: ['estado'],
        where: { pacienteId: paciente.id },
        _count: { estado: true }
      }),

      // Próximas citas
      prisma.cita.findMany({
        where: {
          pacienteId: paciente.id,
          fecha: { gt: finDia },
          estado: { in: ['PENDIENTE', 'CONFIRMADA'] }
        },
        include: {
          doctor: {
            select: {
              foto: true,
              usuario: { select: { nombre: true, apellido: true } }
            }
          },
          servicio: true
        },
        orderBy: { fecha: 'asc' },
        take: 5
      }),

      // Citas este año para gráfico
      prisma.cita.findMany({
        where: { pacienteId: paciente.id, fecha: { gte: inicioAno } },
        select: { fecha: true, estado: true }
      }),

      // Doctores únicos consultados
      prisma.cita.findMany({
        where: { pacienteId: paciente.id, estado: 'COMPLETADA' },
        select: { doctorId: true },
        distinct: ['doctorId']
      }),

      // Últimas consultas completadas
      prisma.cita.findMany({
      where: { pacienteId: paciente.id, estado: 'COMPLETADA' },
      include: {
        doctor: {
          select: {
            foto: true,
            usuario: { select: { nombre: true, apellido: true } }
          }
        },
        servicio: true,
        nota: true
      },
      orderBy: { fecha: 'desc' },
      take: 5
    }),
    ])

    // Gráfico mensual
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const mesActual = hoy.getMonth()
    const graficoMensual = meses.slice(0, mesActual + 1).map((mes, i) => ({
      mes,
      citas: citasAno.filter(c => new Date(c.fecha).getMonth() === i).length,
      completadas: citasAno.filter(c => new Date(c.fecha).getMonth() === i && c.estado === 'COMPLETADA').length,
    }))

    const totalCompletadas = citasPorEstado.find(c => c.estado === 'COMPLETADA')?._count.estado || 0
    const totalCanceladas  = citasPorEstado.find(c => c.estado === 'CANCELADA')?._count.estado  || 0
    const totalPendientes  = citasPorEstado.find(c => c.estado === 'PENDIENTE')?._count.estado  || 0

    res.json({
      resumen: {
        totalCitas,
        totalCompletadas,
        totalCanceladas,
        totalPendientes,
        doctoresUnicos: doctoresUnicos.length,
      },
      proximasCitas,
      ultimasCompletadas,
      graficoMensual,
      citasPorEstado: citasPorEstado.map(c => ({ estado: c.estado, total: c._count.estado }))
    })
  } catch (error) {
    console.error('ERROR getEstadisticasPaciente:', error)
    res.status(500).json({
      message: 'Error en el servidor',
      error: error.message
    })
  }
}

module.exports = { getEstadisticas, getEstadisticasDoctor, getEstadisticasPaciente }