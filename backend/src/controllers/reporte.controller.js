const PDFDocument = require('pdfkit')
const prisma = require('../prisma/client')
const path = require('path')
const fs = require('fs')

const agregarHeaderClinica = async (doc, clinica) => {
  const logoPath = clinica?.logo ? path.join(process.cwd(), clinica.logo) : null

  if (logoPath && fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 40, { width: 60, height: 60 })
    doc.fontSize(18).fillColor('#1a73e8').text(clinica.nombre || 'Clínica', 120, 45, { continued: false })
    doc.fontSize(9).fillColor('#666').text(clinica.direccion || '', 120, 68)
      .text(`${clinica.telefono || ''} · ${clinica.email || ''}`, 120, 82)
  } else {
    doc.fontSize(18).fillColor('#1a73e8').text(clinica?.nombre || 'Clínica', 50, 45)
    doc.fontSize(9).fillColor('#666').text(clinica?.direccion || '', 50, 68)
      .text(`${clinica?.telefono || ''} · ${clinica?.email || ''}`, 50, 82)
  }

  doc.moveTo(50, 110).lineTo(550, 110).strokeColor('#1a73e8').lineWidth(1).stroke()
  doc.y = 120
  doc.moveDown(0.5)
}

// ─── Reporte de Pacientes (usado desde módulo Pacientes) ──────────────────────
const reportePacientes = async (req, res) => {
  try {
    const [pacientes, clinica] = await Promise.all([
      prisma.paciente.findMany({
        include: { usuario: { select: { nombre: true, apellido: true, email: true, telefono: true } } }
      }),
      prisma.clinica.findFirst()
    ])

    const doc = new PDFDocument({ margin: 50 })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=pacientes.pdf')
    doc.pipe(res)

    await agregarHeaderClinica(doc, clinica)

    doc.fontSize(13).fillColor('#1e293b').text('Reporte de Pacientes', { align: 'center' })
    doc.fontSize(9).fillColor('#94a3b8').text(`Generado: ${new Date().toLocaleString('es-PE')}`, { align: 'center' })
    doc.moveDown()

    const tableTop = doc.y
    doc.rect(50, tableTop, 500, 22).fill('#1a73e8')
    doc.fillColor('white').fontSize(9)
      .text('DNI', 55, tableTop + 6).text('Nombre', 120, tableTop + 6)
      .text('Email', 280, tableTop + 6).text('Teléfono', 420, tableTop + 6)
      .text('Género', 490, tableTop + 6)
    doc.y = tableTop + 22

    pacientes.forEach((pac, i) => {
      const y = doc.y
      if (i % 2 === 0) doc.rect(50, y, 500, 20).fill('#f8fafc')
      doc.fillColor('#334155').fontSize(8)
        .text(pac.dni || '—', 55, y + 5)
        .text(`${pac.usuario.nombre} ${pac.usuario.apellido}`, 120, y + 5)
        .text(pac.usuario.email || '—', 280, y + 5)
        .text(pac.usuario.telefono || '—', 420, y + 5)
        .text(pac.genero || '—', 490, y + 5)
      doc.y = y + 20
    })

    doc.moveDown()
    doc.fontSize(8).fillColor('#94a3b8').text(`Total de pacientes: ${pacientes.length}`, { align: 'right' })
    doc.end()
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// ─── Reporte de Citas (usado desde módulo Citas) ──────────────────────────────
const reporteCitas = async (req, res) => {
  try {
    const [citas, clinica] = await Promise.all([
      prisma.cita.findMany({
        include: {
          doctor:   { include: { usuario: { select: { nombre: true, apellido: true } } } },
          paciente: { include: { usuario: { select: { nombre: true, apellido: true } } } },
          servicio: true
        },
        orderBy: { fecha: 'asc' }
      }),
      prisma.clinica.findFirst()
    ])

    const doc = new PDFDocument({ margin: 50 })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=citas.pdf')
    doc.pipe(res)

    await agregarHeaderClinica(doc, clinica)

    doc.fontSize(13).fillColor('#1e293b').text('Reporte de Citas', { align: 'center' })
    doc.fontSize(9).fillColor('#94a3b8').text(`Generado: ${new Date().toLocaleString('es-PE')}`, { align: 'center' })
    doc.moveDown()

    const tableTop = doc.y
    doc.rect(50, tableTop, 500, 22).fill('#1a73e8')
    doc.fillColor('white').fontSize(9)
      .text('Fecha', 55, tableTop + 6).text('Paciente', 130, tableTop + 6)
      .text('Doctor', 265, tableTop + 6).text('Servicio', 380, tableTop + 6)
      .text('Estado', 470, tableTop + 6)
    doc.y = tableTop + 22

    const estadoColors = {
      PENDIENTE: '#f59e0b', CONFIRMADA: '#3b82f6',
      COMPLETADA: '#10b981', CANCELADA: '#ef4444'
    }

    citas.forEach((cita, i) => {
      const y = doc.y
      if (i % 2 === 0) doc.rect(50, y, 500, 20).fill('#f8fafc')
      doc.fillColor('#334155').fontSize(8)
        .text(new Date(cita.fecha).toLocaleDateString('es-PE'), 55, y + 5)
        .text(`${cita.paciente.usuario.nombre} ${cita.paciente.usuario.apellido}`, 130, y + 5)
        .text(`Dr. ${cita.doctor.usuario.nombre} ${cita.doctor.usuario.apellido}`, 265, y + 5)
        .text(cita.servicio.nombre, 380, y + 5)
        .fillColor(estadoColors[cita.estado] || '#334155').text(cita.estado, 470, y + 5)
      doc.y = y + 20
    })

    doc.moveDown()
    doc.fontSize(8).fillColor('#94a3b8').text(`Total de citas: ${citas.length}`, { align: 'right' })
    doc.end()
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// ─── Reporte de Pagos por período (módulo Reportes gerencial) ─────────────────
const reportePagosPeriodo = async (req, res) => {
  try {
    const { inicio, fin } = req.query
    if (!inicio || !fin) return res.status(400).json({ message: 'Se requieren fecha inicio y fin' })

    const [anioI, mesI, diaI] = inicio.split('-').map(Number)
    const [anioF, mesF, diaF] = fin.split('-').map(Number)
    const fechaInicio = new Date(anioI, mesI - 1, diaI, 0, 0, 0)
    const fechaFin    = new Date(anioF, mesF - 1, diaF, 23, 59, 59)

    const [pagos, clinica] = await Promise.all([
      prisma.pago.findMany({
        where: { createdAt: { gte: fechaInicio, lte: fechaFin } },
        include: {
          cita: {
            include: {
              paciente: { include: { usuario: { select: { nombre: true, apellido: true } } } },
              doctor:   { include: { usuario: { select: { nombre: true, apellido: true } } } },
              servicio: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.clinica.findFirst()
    ])

    const doc = new PDFDocument({ margin: 50 })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=pagos-${inicio}-${fin}.pdf`)
    doc.pipe(res)

    await agregarHeaderClinica(doc, clinica)

    doc.fontSize(13).fillColor('#1e293b').text('Reporte de Pagos por Período', { align: 'center' })
    doc.fontSize(9).fillColor('#94a3b8')
      .text(`Período: ${new Date(fechaInicio).toLocaleDateString('es-PE')} — ${new Date(fechaFin).toLocaleDateString('es-PE')}`, { align: 'center' })
      .text(`Generado: ${new Date().toLocaleString('es-PE')}`, { align: 'center' })
    doc.moveDown()

    // Resumen rápido
    const totalPeriodo = pagos.reduce((acc, p) => acc + p.monto, 0)
    const porMetodo = pagos.reduce((acc, p) => {
      acc[p.metodo] = (acc[p.metodo] || 0) + p.monto
      return acc
    }, {})

    doc.rect(50, doc.y, 500, 50).fill('#f8fafc')
    const resumenY = doc.y + 8
    doc.fillColor('#1e293b').fontSize(10).text(`Total del período: S/ ${totalPeriodo.toFixed(2)}`, 60, resumenY, { continued: false })
    const metodos = Object.entries(porMetodo).map(([m, v]) => `${m}: S/ ${v.toFixed(2)}`).join('   ·   ')
    doc.fontSize(8).fillColor('#64748b').text(metodos, 60, resumenY + 18)
    doc.y = resumenY + 50
    doc.moveDown(0.5)

    // Tabla
    const tableTop = doc.y
    doc.rect(50, tableTop, 500, 22).fill('#10b981')
    doc.fillColor('white').fontSize(9)
      .text('Fecha',    55,  tableTop + 6)
      .text('Paciente', 130, tableTop + 6)
      .text('Servicio', 270, tableTop + 6)
      .text('Doctor',   370, tableTop + 6)
      .text('Método',   460, tableTop + 6)
      .text('Monto',    510, tableTop + 6)
    doc.y = tableTop + 22

    pagos.forEach((pago, i) => {
      const y = doc.y
      if (i % 2 === 0) doc.rect(50, y, 500, 20).fill('#f8fafc')
      doc.fillColor('#334155').fontSize(8)
        .text(new Date(pago.createdAt).toLocaleDateString('es-PE'), 55, y + 5)
        .text(`${pago.cita.paciente.usuario.nombre} ${pago.cita.paciente.usuario.apellido}`, 130, y + 5)
        .text(pago.cita.servicio.nombre, 270, y + 5)
        .text(`Dr. ${pago.cita.doctor.usuario.apellido}`, 370, y + 5)
        .text(pago.metodo, 460, y + 5)
        .fillColor('#10b981').text(`S/ ${pago.monto.toFixed(2)}`, 510, y + 5)
      doc.y = y + 20
    })

    doc.moveDown()
    doc.fontSize(9).fillColor('#10b981').text(`Total: S/ ${totalPeriodo.toFixed(2)}`, { align: 'right' })
    doc.fontSize(8).fillColor('#94a3b8').text(`${pagos.length} pago${pagos.length !== 1 ? 's' : ''} en el período`, { align: 'right' })
    doc.end()
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// ─── Reporte de Rendimiento por Doctor (módulo Reportes gerencial) ────────────
const reporteRendimientoDoctor = async (req, res) => {
  try {
    const { inicio, fin } = req.query
    if (!inicio || !fin) return res.status(400).json({ message: 'Se requieren fecha inicio y fin' })

    const [anioI, mesI, diaI] = inicio.split('-').map(Number)
    const [anioF, mesF, diaF] = fin.split('-').map(Number)
    const fechaInicio = new Date(anioI, mesI - 1, diaI, 0, 0, 0)
    const fechaFin    = new Date(anioF, mesF - 1, diaF, 23, 59, 59)

    const [doctores, clinica] = await Promise.all([
      prisma.doctor.findMany({
        include: {
          usuario: { select: { nombre: true, apellido: true, email: true } },
          citas: {
            where: { fecha: { gte: fechaInicio, lte: fechaFin } },
            include: { servicio: true, pago: true }
          }
        }
      }),
      prisma.clinica.findFirst()
    ])

    // Calcular métricas por doctor
    const rendimiento = doctores.map(doc => {
      const total      = doc.citas.length
      const completadas = doc.citas.filter(c => c.estado === 'COMPLETADA').length
      const canceladas  = doc.citas.filter(c => c.estado === 'CANCELADA').length
      const pendientes  = doc.citas.filter(c => c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA').length
      const ingresos    = doc.citas.reduce((acc, c) => acc + (c.pago?.monto || 0), 0)
      return {
        nombre: `Dr. ${doc.usuario.nombre} ${doc.usuario.apellido}`,
        especialidad: doc.especialidad,
        total, completadas, canceladas, pendientes, ingresos
      }
    }).sort((a, b) => b.completadas - a.completadas)

    const doc = new PDFDocument({ margin: 50 })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=rendimiento-doctores-${inicio}-${fin}.pdf`)
    doc.pipe(res)

    await agregarHeaderClinica(doc, clinica)

    doc.fontSize(13).fillColor('#1e293b').text('Reporte de Rendimiento por Doctor', { align: 'center' })
    doc.fontSize(9).fillColor('#94a3b8')
      .text(`Período: ${new Date(fechaInicio).toLocaleDateString('es-PE')} — ${new Date(fechaFin).toLocaleDateString('es-PE')}`, { align: 'center' })
      .text(`Generado: ${new Date().toLocaleString('es-PE')}`, { align: 'center' })
    doc.moveDown()

    // Tabla
    const tableTop = doc.y
    doc.rect(50, tableTop, 500, 22).fill('#6366f1')
    doc.fillColor('white').fontSize(9)
      .text('Doctor',       55,  tableTop + 6)
      .text('Especialidad', 200, tableTop + 6)
      .text('Total',        320, tableTop + 6)
      .text('Completadas',  360, tableTop + 6)
      .text('Canceladas',   420, tableTop + 6)
      .text('Ingresos',     475, tableTop + 6)
    doc.y = tableTop + 22

    rendimiento.forEach((r, i) => {
      const y = doc.y
      if (i % 2 === 0) doc.rect(50, y, 500, 22).fill('#f8fafc')
      doc.fillColor('#334155').fontSize(8)
        .text(r.nombre,       55,  y + 6)
        .text(r.especialidad, 200, y + 6)
        .text(String(r.total),        320, y + 6)
        .fillColor('#10b981').text(String(r.completadas), 360, y + 6)
        .fillColor('#ef4444').text(String(r.canceladas),  420, y + 6)
        .fillColor('#6366f1').text(`S/ ${r.ingresos.toFixed(2)}`, 475, y + 6)
      doc.y = y + 22
    })

    // Totales generales
    const totalCitas      = rendimiento.reduce((a, r) => a + r.total, 0)
    const totalCompletadas = rendimiento.reduce((a, r) => a + r.completadas, 0)
    const totalIngresos   = rendimiento.reduce((a, r) => a + r.ingresos, 0)

    doc.moveDown(0.5)
    doc.rect(50, doc.y, 500, 22).fill('#6366f1')
    const totY = doc.y + 6
    doc.fillColor('white').fontSize(9)
      .text('TOTALES', 55, totY)
      .text(String(totalCitas), 320, totY)
      .text(String(totalCompletadas), 360, totY)
      .text(`S/ ${totalIngresos.toFixed(2)}`, 475, totY)
    doc.y = totY + 22

    doc.moveDown()
    doc.fontSize(8).fillColor('#94a3b8')
      .text(`${doctores.length} doctor${doctores.length !== 1 ? 'es' : ''} en el sistema`, { align: 'right' })
    doc.end()
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

module.exports = { reportePacientes, reporteCitas, reportePagosPeriodo, reporteRendimientoDoctor }

// ─── Resumen individual de Cita (desde ModalVerCita) ─────────────────────────
// ─── Resumen individual de Cita (desde ModalVerCita) ─────────────────────────
const reporteCitaIndividual = async (req, res) => {
  try {
    const { id } = req.params

    const [cita, clinica] = await Promise.all([
      prisma.cita.findUnique({
        where: { id: parseInt(id) },
        include: {
          doctor: {
            include: {
              usuario: {
                select: { nombre: true, apellido: true, email: true, telefono: true }
              }
            }
          },
          paciente: {
            include: {
              usuario: {
                select: { nombre: true, apellido: true, email: true, telefono: true }
              }
            }
          },
          servicio: true,
          nota: true,
          pago: true
        }
      }),
      prisma.clinica.findFirst()
    ])

    if (!cita) return res.status(404).json({ message: 'Cita no encontrada' })

    const doc = new PDFDocument({ margin: 45, size: 'A4' })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=cita-${id}.pdf`)
    doc.pipe(res)

    const COLORS = {
      primary: '#000089',
      accent: '#00CCA5',
      accentDark: '#008f78',
      text: '#1e293b',
      muted: '#64748b',
      light: '#f8fafc',
      border: '#e2e8f0'
    }

    const estadoColors = {
      PENDIENTE: '#f59e0b',
      CONFIRMADA: COLORS.primary,
      COMPLETADA: COLORS.accentDark,
      CANCELADA: '#ef4444'
    }

    const pageLeft = 45
    const pageRight = 550
    const pageWidth = 505
    let y = 38

    const logoPath = clinica?.logo ? path.join(process.cwd(), clinica.logo) : null

    // Header institucional
    if (logoPath && fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, pageLeft, y, { fit: [120, 45] })
      } catch {
        doc.fontSize(17).fillColor(COLORS.primary).text(clinica?.nombre || 'LuminaMedic', pageLeft, y)
      }
    } else {
      doc.fontSize(17).fillColor(COLORS.primary).text(clinica?.nombre || 'LuminaMedic', pageLeft, y)
    }

    doc
      .fontSize(8.5)
      .fillColor(COLORS.muted)
      .text(clinica?.direccion || '', pageLeft, 78, { width: 290 })
      .text(`${clinica?.telefono || ''} · ${clinica?.email || ''}`, pageLeft, 92, { width: 290 })

    doc
      .fontSize(18)
      .fillColor(COLORS.text)
      .text('Resumen de Cita', 330, 40, { width: 220, align: 'right' })

    doc
      .fontSize(8.5)
      .fillColor(COLORS.muted)
      .text(`Generado: ${new Date().toLocaleString('es-PE')}`, 330, 64, {
        width: 220,
        align: 'right'
      })

    const colorEstado = estadoColors[cita.estado] || COLORS.muted

    doc
      .fontSize(10)
      .fillColor(colorEstado)
      .text(`Cita #${cita.id} — ${cita.estado}`, 330, 88, {
        width: 220,
        align: 'right'
      })

    y = 120

    doc
      .moveTo(pageLeft, y)
      .lineTo(pageRight, y)
      .strokeColor(COLORS.primary)
      .lineWidth(1.2)
      .stroke()

    y += 18

    const formatFecha = (fecha) =>
      new Date(fecha).toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

    const formatFechaCorta = (fecha) =>
      new Date(fecha).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })

    const section = (title) => {
      doc
        .rect(pageLeft, y, pageWidth, 20)
        .fill(COLORS.primary)

      doc
        .fontSize(8.5)
        .fillColor('white')
        .text(title, pageLeft + 10, y + 6)

      y += 28
    }

    const row = (label, value, x = pageLeft, labelWidth = 120, valueWidth = 350) => {
      doc
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(label, x, y, { width: labelWidth })

      doc
        .fontSize(9)
        .fillColor(COLORS.text)
        .text(value || '—', x + labelWidth, y, {
          width: valueWidth,
          lineGap: 1
        })

      y += 16
    }

    const twoColRow = (label1, value1, label2, value2) => {
      doc
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(label1, pageLeft, y, { width: 80 })

      doc
        .fontSize(9)
        .fillColor(COLORS.text)
        .text(value1 || '—', pageLeft + 80, y, { width: 160 })

      doc
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(label2, 315, y, { width: 80 })

      doc
        .fontSize(9)
        .fillColor(COLORS.text)
        .text(value2 || '—', 395, y, { width: 150 })

      y += 16
    }

    const paragraphRow = (label, value, maxHeight = 34) => {
      doc
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(label, pageLeft, y, { width: 120 })

      doc
        .fontSize(9)
        .fillColor(COLORS.text)
        .text(value || '—', pageLeft + 120, y, {
          width: 370,
          height: maxHeight,
          ellipsis: true,
          lineGap: 1
        })

      y += maxHeight + 4
    }

    // Información de cita
    section('INFORMACIÓN DE LA CITA')
    row('Fecha y hora', formatFecha(cita.fecha))
    row('Servicio', `${cita.servicio.nombre} (${cita.servicio.duracion} min)`)
    row('Precio', `S/ ${Number(cita.servicio.precio || 0).toFixed(2)}`)
    paragraphRow('Motivo', cita.motivo || 'No especificado', 24)

    y += 6

    // Paciente y doctor en dos columnas
    section('PACIENTE Y DOCTOR')
    twoColRow(
      'Paciente',
      `${cita.paciente.usuario.nombre} ${cita.paciente.usuario.apellido}`,
      'Doctor',
      `Dr. ${cita.doctor.usuario.nombre} ${cita.doctor.usuario.apellido}`
    )
    twoColRow(
      'Email',
      cita.paciente.usuario.email || '—',
      'Email',
      cita.doctor.usuario.email || '—'
    )
    twoColRow(
      'Teléfono',
      cita.paciente.usuario.telefono || '—',
      'Teléfono',
      cita.doctor.usuario.telefono || '—'
    )

    y += 6

    // Pago
    if (cita.pago) {
      section('PAGO')
      twoColRow(
        'Monto',
        `S/ ${Number(cita.pago.monto || 0).toFixed(2)}`,
        'Método',
        cita.pago.metodo || '—'
      )
      row('Fecha de pago', formatFechaCorta(cita.pago.createdAt))
      y += 6
    }

    // Nota clínica
    section('NOTA CLÍNICA')

    if (cita.nota) {
      paragraphRow('Diagnóstico', cita.nota.diagnostico || '—', 28)
      paragraphRow('Tratamiento', cita.nota.tratamiento || '—', 32)
      paragraphRow('Receta', cita.nota.receta || '—', 32)
      paragraphRow('Observaciones', cita.nota.observacion || '—', 36)
    } else {
      row('Estado', 'Esta cita aún no tiene una nota clínica registrada.')
    }

    // Footer
    doc
      .moveTo(pageLeft, 770)
      .lineTo(pageRight, 770)
      .strokeColor(COLORS.border)
      .lineWidth(1)
      .stroke()

    doc
      .fontSize(7.5)
      .fillColor(COLORS.muted)
      .text(
        'Documento generado automáticamente por LuminaMedic · Sistema de Gestión Clínica',
        pageLeft,
        780,
        { width: pageWidth, align: 'center' }
      )

    doc.end()
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// ─── Recibo individual de Pago ────────────────────────────────────────────────
const reportePagoIndividual = async (req, res) => {
  try {
    const { id } = req.params
    const [pago, clinica] = await Promise.all([
      prisma.pago.findUnique({
        where: { id: parseInt(id) },
        include: {
          cita: {
            include: {
              paciente: { include: { usuario: { select: { nombre: true, apellido: true, email: true, telefono: true } } } },
              doctor:   { include: { usuario: { select: { nombre: true, apellido: true } } } },
              servicio: true
            }
          }
        }
      }),
      prisma.clinica.findFirst()
    ])

    if (!pago) return res.status(404).json({ message: 'Pago no encontrado' })

    const doc = new PDFDocument({ margin: 50 })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=recibo-pago-${id}.pdf`)
    doc.pipe(res)

    await agregarHeaderClinica(doc, clinica)

    // Título
    doc.fontSize(13).fillColor('#1e293b').text('Recibo de Pago', { align: 'center' })
    doc.fontSize(9).fillColor('#94a3b8').text(`Generado: ${new Date().toLocaleString('es-PE')}`, { align: 'center' })
    doc.moveDown()

    // Número de recibo destacado
    doc.rect(50, doc.y, 500, 40).fill('#f0fdf4')
    const reciboY = doc.y + 10
    doc.fillColor('#10b981').fontSize(14).text(`Recibo #${pago.id}`, 56, reciboY)
    doc.fillColor('#10b981').fontSize(18).text(`S/ ${pago.monto.toFixed(2)}`, 0, reciboY, { align: 'right' })
    doc.y = reciboY + 40
    doc.moveDown(0.5)

    const seccionTitulo = (titulo) => {
      doc.rect(50, doc.y, 500, 20).fill('#10b981')
      doc.fillColor('white').fontSize(9).text(titulo, 56, doc.y - 14)
      doc.y += 6
      doc.moveDown(0.3)
    }

    const fila = (label, value) => {
      const y = doc.y
      doc.fillColor('#94a3b8').fontSize(8).text(label, 56, y)
      doc.fillColor('#1e293b').fontSize(9).text(value || '—', 200, y)
      doc.y = y + 18
    }

    seccionTitulo('DETALLE DEL PAGO')
    fila('Fecha de pago', new Date(pago.createdAt).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }))
    fila('Método de pago', pago.metodo)
    fila('Monto', `S/ ${pago.monto.toFixed(2)}`)
    doc.moveDown(0.5)

    seccionTitulo('SERVICIO')
    fila('Nombre', pago.cita.servicio.nombre)
    fila('Duración', `${pago.cita.servicio.duracion} minutos`)
    fila('Fecha de cita', new Date(pago.cita.fecha).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }))
    fila('Doctor', `Dr. ${pago.cita.doctor.usuario.nombre} ${pago.cita.doctor.usuario.apellido}`)
    doc.moveDown(0.5)

    seccionTitulo('PACIENTE')
    fila('Nombre', `${pago.cita.paciente.usuario.nombre} ${pago.cita.paciente.usuario.apellido}`)
    fila('Email', pago.cita.paciente.usuario.email)
    fila('Teléfono', pago.cita.paciente.usuario.telefono || '—')
    doc.moveDown()

    // Firma / sello
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e2e8f0').lineWidth(1).stroke()
    doc.moveDown(0.5)
    doc.fontSize(8).fillColor('#94a3b8').text('Este documento es un comprobante de pago generado automáticamente por el sistema.', { align: 'center' })

    doc.end()
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

module.exports = { reportePacientes, reporteCitas, reportePagosPeriodo, reporteRendimientoDoctor, reporteCitaIndividual, reportePagoIndividual }