const cron = require('node-cron')
const prisma = require('../prisma/client')
const { enviarEmailRecordatorio, enviarEmailRecordatorioDoctor } = require('./email.service')
const logger = require('../utils/logger')

const iniciarRecordatorios = () => {
  cron.schedule('0 8 * * *', async () => {
    logger.info('[Recordatorios] Ejecutando cron job...')

    try {
      const hoy = new Date()
      const manana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1)
      const inicioManana = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 0, 0, 0)
      const finManana    = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 23, 59, 59)

      // Solo citas CONFIRMADAS que no han recibido recordatorio aún
      const citas = await prisma.cita.findMany({
        where: {
          estado: { in: ['CONFIRMADA', 'PENDIENTE'] },
          fecha: { gte: inicioManana, lte: finManana },
          recordatorioEnviado: false
        },
        include: {
          paciente: { include: { usuario: true } },
          doctor:   { include: { usuario: true } },
          servicio: true,
          // Incluir clínica para mostrar dirección en el email
          doctor: {
            include: {
              usuario: true,
              clinica: true
            }
          }
        }
      })

      logger.info(`[Recordatorios] ${citas.length} cita(s) para mañana sin recordatorio enviado`)

      let enviados = 0
      let errores  = 0

      for (const cita of citas) {
        const datos = {
          doctorNombre:    `${cita.doctor.usuario.nombre} ${cita.doctor.usuario.apellido}`,
          pacienteNombre:  `${cita.paciente.usuario.nombre} ${cita.paciente.usuario.apellido}`,
          pacienteEmail:   cita.paciente.usuario.email,
          doctorEmail:     cita.doctor.usuario.email,
          servicio:        cita.servicio.nombre,
          fecha:           cita.fecha,
          clinicaNombre:   cita.doctor.clinica?.nombre   || 'MediCare',
          clinicaDireccion:cita.doctor.clinica?.direccion || '',
          clinicaTelefono: cita.doctor.clinica?.telefono  || '',
        }

        let exitoPaciente = false
        let exitoDoctor   = false

        // ── Email al paciente ──
        try {
          await enviarEmailRecordatorio(datos)
          exitoPaciente = true
          logger.info(`[Recordatorios] Email enviado al paciente: ${datos.pacienteEmail}`)
        } catch (err) {
          logger.error(`[Recordatorios] Error enviando al paciente ${datos.pacienteEmail}`, { error: err.message })
          errores++
        }

        // ── Email al doctor ──
        try {
          await enviarEmailRecordatorioDoctor(datos)
          exitoDoctor = true
          logger.info(`[Recordatorios] Email enviado al doctor: ${datos.doctorEmail}`)
        } catch (err) {
          logger.error(`[Recordatorios] Error enviando al doctor ${datos.doctorEmail}`, { error: err.message })
          errores++
        }

        // Marcar como enviado si al menos el del paciente llegó
        if (exitoPaciente || exitoDoctor) {
          await prisma.cita.update({
            where: { id: cita.id },
            data:  { recordatorioEnviado: true }
          })
          enviados++
        }
      }

      logger.info(`[Recordatorios] Cron finalizado — Enviados: ${enviados}, Errores: ${errores}`)

    } catch (err) {
      logger.error('[Recordatorios] Error crítico en cron job', { error: err.message })
    }
  }, {
    timezone: 'America/Lima'
  })

  logger.info('[Recordatorios] Cron job iniciado — corre diariamente a las 8:00 AM (Lima)')
}

module.exports = { iniciarRecordatorios }