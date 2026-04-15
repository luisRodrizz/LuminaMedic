const prisma = require('../prisma/client')

const registrarPago = async (req, res) => {
  try {
    const { citaId, monto, metodo } = req.body

    const cita = await prisma.cita.findUnique({ where: { id: parseInt(citaId) } })
    if (!cita) return res.status(404).json({ message: 'Cita no encontrada' })

    const pagoExiste = await prisma.pago.findUnique({ where: { citaId: parseInt(citaId) } })
    if (pagoExiste) return res.status(400).json({ message: 'Esta cita ya tiene un pago registrado' })

    const pago = await prisma.pago.create({
      data: {
        citaId: parseInt(citaId),
        monto: parseFloat(monto),
        metodo
      }
    })

    // Marcar cita como completada automáticamente
    await prisma.cita.update({
      where: { id: parseInt(citaId) },
      data: { estado: 'COMPLETADA' }
    })

    res.status(201).json({ message: 'Pago registrado correctamente', pago })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const obtenerPagos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [pagos, total] = await Promise.all([
      prisma.pago.findMany({
        skip,
        take: limit,
        include: {
          cita: {
            include: {
              paciente: { include: { usuario: { select: { nombre: true, apellido: true } } } },
              doctor: { include: { usuario: { select: { nombre: true, apellido: true } } } },
              servicio: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pago.count()
    ])

    res.json({
      data: pagos,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const obtenerResumenPagos = async (req, res) => {
  try {
    const hoy = new Date()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

    const [totalGeneral, totalMes, porMetodo] = await Promise.all([
      prisma.pago.aggregate({ _sum: { monto: true } }),
      prisma.pago.aggregate({
        _sum: { monto: true },
        where: { createdAt: { gte: inicioMes } }
      }),
      prisma.pago.groupBy({
        by: ['metodo'],
        _sum: { monto: true },
        _count: { metodo: true }
      })
    ])

    res.json({
      totalGeneral: totalGeneral._sum.monto || 0,
      totalMes: totalMes._sum.monto || 0,
      porMetodo: porMetodo.map(p => ({
        metodo: p.metodo,
        total: p._sum.monto,
        cantidad: p._count.metodo
      }))
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const reportePagosPDF = async (req, res) => {
  try {
    const PDFDocument = require('pdfkit')
    const pagos = await prisma.pago.findMany({
      include: {
        cita: {
          include: {
            paciente: { include: { usuario: { select: { nombre: true, apellido: true } } } },
            doctor: { include: { usuario: { select: { nombre: true, apellido: true } } } },
            servicio: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const doc = new PDFDocument({ margin: 50 })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=pagos.pdf')
    doc.pipe(res)

    doc.fontSize(20).fillColor('#1a73e8').text('Reporte de Pagos', { align: 'center' })
    doc.fontSize(10).fillColor('#666').text(`Generado: ${new Date().toLocaleString('es-PE')}`, { align: 'center' })
    doc.moveDown()

    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#1a73e8').stroke()
    doc.moveDown()

    doc.rect(50, doc.y, 500, 20).fill('#1a73e8')
    doc.fillColor('white').fontSize(9)
      .text('Fecha', 55, doc.y - 15)
      .text('Paciente', 130, doc.y - 15)
      .text('Servicio', 280, doc.y - 15)
      .text('Método', 390, doc.y - 15)
      .text('Monto', 470, doc.y - 15)
    doc.moveDown()

    let totalGeneral = 0
    pagos.forEach((pago, i) => {
      const y = doc.y
      if (i % 2 === 0) doc.rect(50, y, 500, 20).fill('#f5f5f5')
      const fecha = new Date(pago.createdAt).toLocaleDateString('es-PE')
      totalGeneral += pago.monto
      doc.fillColor('#333').fontSize(8)
        .text(fecha, 55, y + 5)
        .text(`${pago.cita.paciente.usuario.nombre} ${pago.cita.paciente.usuario.apellido}`, 130, y + 5)
        .text(pago.cita.servicio.nombre, 280, y + 5)
        .text(pago.metodo, 390, y + 5)
        .text(`S/ ${pago.monto.toFixed(2)}`, 470, y + 5)
      doc.moveDown(0.5)
    })

    doc.moveDown()
    doc.fontSize(10).fillColor('#1a73e8')
      .text(`Total general: S/ ${totalGeneral.toFixed(2)}`, { align: 'right' })

    doc.end()
  } catch (error) {
    res.status(500).json({ message: 'Error generando PDF' })
  }
}

const obtenerMisPagos = async (req, res) => {
  try {
    const paciente = await prisma.paciente.findUnique({ where: { usuarioId: req.user.id } })
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' })
 
    const pagos = await prisma.pago.findMany({
      where: { cita: { pacienteId: paciente.id } },
      include: {
        cita: {
          include: {
            doctor:  { include: { usuario: { select: { nombre: true, apellido: true } } } },
            servicio: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
 
    const total = pagos.reduce((acc, p) => acc + p.monto, 0)
 
    res.json({ pagos, total })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

module.exports = { registrarPago, obtenerPagos, obtenerResumenPagos, reportePagosPDF, obtenerMisPagos }