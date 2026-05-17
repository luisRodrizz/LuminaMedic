const nodemailer = require('nodemailer')

// ─── Marca ───────────────────────────────────────────────────────────────────
const BRAND_NAME = 'LuminaMedic'
const BRAND_TAGLINE = 'Salud premium al alcance de todos'
const BRAND_PRIMARY = '#000089'
const BRAND_ACCENT = '#00CCA5'
const BRAND_BG = '#f8fbfc'

// En local usará localhost si no existe FRONTEND_URL.
// En producción Render debe tener FRONTEND_URL=https://sistema-clinico-cyan.vercel.app
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

console.log('EMAIL_USER existe:', Boolean(process.env.EMAIL_USER))
console.log('EMAIL_PASS existe:', Boolean(process.env.EMAIL_PASS))
console.log('FRONTEND_URL:', FRONTEND_URL)

// ─── Transporter ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000
})

// ─── Exponential backoff helper ───────────────────────────────────────────────
const enviarConReintentos = async (opciones, intentos = 3) => {
  for (let i = 0; i < intentos; i++) {
    try {
      const info = await transporter.sendMail(opciones)

      console.log('Email enviado correctamente:', {
        to: opciones.to,
        messageId: info.messageId,
        response: info.response
      })

      return

    } catch (error) {
      const esUltimoIntento = i === intentos - 1

      if (esUltimoIntento) {
        console.error(`Email fallido tras ${intentos} intentos:`, {
          message: error.message,
          code: error.code,
          command: error.command,
          response: error.response,
          responseCode: error.responseCode
        })
        throw error
      }

      const espera = Math.pow(2, i) * 1000
      console.warn(`Reintento ${i + 1} de email en ${espera / 1000}s...`)
      await new Promise(resolve => setTimeout(resolve, espera))
    }
  }
}

// ─── Estilos base compartidos ─────────────────────────────────────────────────
const estiloBase = {
  fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
  maxWidth: '600px'
}

const htmlWrapper = (contenido, colorHeader = BRAND_PRIMARY) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="margin: 0; padding: 0; background-color: ${BRAND_BG}; font-family: ${estiloBase.fontFamily};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND_BG}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: ${estiloBase.maxWidth}; background-color: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 60px rgba(15,23,42,0.10);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${colorHeader} 0%, #071299 58%, #008f78 100%); padding: 36px 40px;">
              <p style="margin: 0; color: rgba(255,255,255,0.72); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 700;">
                Sistema de Gestión Clínica
              </p>

              <h1 style="margin: 8px 0 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.4px;">
                <span style="color: ${BRAND_ACCENT};">Lumina</span>Medic<span style="color: ${BRAND_ACCENT};">.</span>
              </h1>

              <p style="margin: 6px 0 0; color: rgba(255,255,255,0.76); font-size: 12px;">
                ${BRAND_TAGLINE}
              </p>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding: 40px;">
              ${contenido}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
                Este mensaje fue generado automáticamente. Por favor no respondas a este correo.<br>
                Si tienes dudas, contáctanos directamente a través de los canales oficiales de ${BRAND_NAME}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

const badge = (texto, color) => `
  <span style="display: inline-block; padding: 4px 12px; background-color: ${color}15; color: ${color}; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.3px;">
    ${texto}
  </span>
`

const filaDetalle = (label, valor) => `
  <tr>
    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
      <p style="margin: 0; color: #94a3b8; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;">
        ${label}
      </p>
      <p style="margin: 4px 0 0; color: #1e293b; font-size: 15px; font-weight: 500;">
        ${valor}
      </p>
    </td>
  </tr>
`

// ─── Email: Cita creada ───────────────────────────────────────────────────────
const enviarEmailCitaCreada = async ({
  pacienteEmail,
  pacienteNombre,
  doctorNombre,
  servicio,
  fecha
}) => {
  const fechaFormateada = new Date(fecha).toLocaleString('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const contenido = `
    <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 22px; font-weight: 800;">
      Cita confirmada
    </h2>

    <p style="margin: 0 0 28px; color: #64748b; font-size: 15px; line-height: 1.7;">
      Hola <strong style="color: #1e293b;">${pacienteNombre}</strong>, tu cita en <strong>${BRAND_NAME}</strong> ha sido agendada exitosamente.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; padding: 4px 20px; margin-bottom: 28px;">
      ${filaDetalle('Fecha y hora', fechaFormateada)}
      ${filaDetalle('Médico', `Dr. ${doctorNombre}`)}
      ${filaDetalle('Servicio', servicio)}
    </table>

    <div style="background-color: #ecfdf7; border-left: 4px solid ${BRAND_ACCENT}; padding: 16px 20px; border-radius: 0 12px 12px 0;">
      <p style="margin: 0; color: #006b5a; font-size: 13px; line-height: 1.6;">
        <strong>Recuerda:</strong> Te recomendamos llegar 10 minutos antes de tu cita. Si necesitas cancelar o reprogramar, hazlo con anticipación desde tu panel o contacta a la clínica.
      </p>
    </div>
  `

  await enviarConReintentos({
    from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
    to: pacienteEmail,
    subject: `Cita confirmada — ${BRAND_NAME}`,
    html: htmlWrapper(contenido, BRAND_PRIMARY)
  })
}

// ─── Email: Cambio de estado ──────────────────────────────────────────────────
const enviarEmailCambioEstado = async ({
  pacienteEmail,
  pacienteNombre,
  estado,
  servicio,
  fecha
}) => {
  const fechaFormateada = new Date(fecha).toLocaleString('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const estadoInfo = {
    CONFIRMADA: {
      texto: 'Confirmada',
      color: BRAND_PRIMARY,
      header: BRAND_PRIMARY,
      mensaje: 'Tu cita ha sido confirmada.'
    },
    CANCELADA: {
      texto: 'Cancelada',
      color: '#dc2626',
      header: '#7f1d1d',
      mensaje: 'Tu cita ha sido cancelada.'
    },
    COMPLETADA: {
      texto: 'Completada',
      color: '#16a34a',
      header: '#14532d',
      mensaje: 'Tu consulta ha sido completada. Puedes revisar tu historial clínico desde tu panel.'
    },
    PENDIENTE: {
      texto: 'Pendiente',
      color: '#d97706',
      header: '#78350f',
      mensaje: 'Tu cita está en estado pendiente.'
    },
    REPROGRAMADA: {
      texto: 'Reprogramada',
      color: '#7c3aed',
      header: '#4c1d95',
      mensaje: 'Tu cita ha sido reprogramada a una nueva fecha.'
    }
  }

  const info = estadoInfo[estado] || {
    texto: estado,
    color: '#475569',
    header: BRAND_PRIMARY,
    mensaje: 'El estado de tu cita ha sido actualizado.'
  }

  const contenido = `
    <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 22px; font-weight: 800;">
      Actualización de cita
    </h2>

    <p style="margin: 0 0 20px; color: #64748b; font-size: 15px; line-height: 1.7;">
      Hola <strong style="color: #1e293b;">${pacienteNombre}</strong>, te informamos sobre un cambio en tu cita de <strong>${BRAND_NAME}</strong>.
    </p>

    <div style="margin-bottom: 24px;">
      <p style="margin: 0 0 8px; color: #94a3b8; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;">
        Estado actual
      </p>
      ${badge(info.texto, info.color)}
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; padding: 4px 20px; margin-bottom: 24px;">
      ${filaDetalle('Servicio', servicio)}
      ${filaDetalle('Fecha', fechaFormateada)}
    </table>

    <div style="background-color: #f8fafc; border-left: 4px solid ${info.color}; padding: 16px 20px; border-radius: 0 12px 12px 0;">
      <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.6;">
        ${info.mensaje}
      </p>
    </div>
  `

  await enviarConReintentos({
    from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
    to: pacienteEmail,
    subject: `Cita ${info.texto.toLowerCase()} — ${BRAND_NAME}`,
    html: htmlWrapper(contenido, info.header)
  })
}

// ─── Email: Recuperación de contraseña ───────────────────────────────────────
const enviarEmailRecuperacion = async ({ email, nombre, token }) => {
  const urlRecuperacion = `${FRONTEND_URL}/reset-password?token=${token}`

  const contenido = `
    <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 22px; font-weight: 800;">
      Recuperación de contraseña
    </h2>

    <p style="margin: 0 0 28px; color: #64748b; font-size: 15px; line-height: 1.7;">
      Hola <strong style="color: #1e293b;">${nombre}</strong>, recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong style="color: #1e293b;">${BRAND_NAME}</strong>.
    </p>

    <div style="text-align: center; margin-bottom: 28px;">
      <a href="${urlRecuperacion}"
        style="display: inline-block; background-color: ${BRAND_PRIMARY}; color: #ffffff; padding: 14px 36px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 800; letter-spacing: 0.2px;">
        Restablecer contraseña
      </a>
    </div>

    <div style="background-color: #ecfdf7; border-left: 4px solid ${BRAND_ACCENT}; padding: 16px 20px; border-radius: 0 12px 12px 0; margin-bottom: 24px;">
      <p style="margin: 0; color: #006b5a; font-size: 13px; line-height: 1.6;">
        <strong>Este enlace expira en 30 minutos.</strong> Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.
      </p>
    </div>

    <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
      Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
      <a href="${urlRecuperacion}" style="color: ${BRAND_PRIMARY}; word-break: break-all;">
        ${urlRecuperacion}
      </a>
    </p>
  `

  await enviarConReintentos({
    from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Restablece tu contraseña — ${BRAND_NAME}`,
    html: htmlWrapper(contenido, BRAND_PRIMARY)
  })
}

// ─── Email: Recordatorio al paciente ─────────────────────────────────────────
const enviarEmailRecordatorio = async ({
  pacienteEmail,
  pacienteNombre,
  doctorNombre,
  servicio,
  fecha,
  clinicaNombre = BRAND_NAME,
  clinicaDireccion = '',
  clinicaTelefono = ''
}) => {
  const fechaFormateada = new Date(fecha).toLocaleString('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const contenido = `
    <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 22px; font-weight: 800;">
      Recordatorio de cita
    </h2>

    <p style="margin: 0 0 28px; color: #64748b; font-size: 15px; line-height: 1.7;">
      Hola <strong style="color: #1e293b;">${pacienteNombre}</strong>, te recordamos que tienes una cita programada para <strong style="color: #1e293b;">mañana</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; padding: 4px 20px; margin-bottom: 28px;">
      ${filaDetalle('Fecha y hora', fechaFormateada)}
      ${filaDetalle('Médico', `Dr. ${doctorNombre}`)}
      ${filaDetalle('Servicio', servicio)}
      ${clinicaDireccion ? filaDetalle('Dirección', clinicaDireccion) : ''}
      ${clinicaTelefono ? filaDetalle('Teléfono clínica', clinicaTelefono) : ''}
    </table>

    <div style="background-color: #ecfdf7; border-left: 4px solid ${BRAND_ACCENT}; padding: 16px 20px; border-radius: 0 12px 12px 0;">
      <p style="margin: 0; color: #006b5a; font-size: 13px; line-height: 1.6;">
        <strong>Recuerda:</strong> Llega 10 minutos antes. Si necesitas cancelar o reprogramar, contáctanos con anticipación.
      </p>
    </div>
  `

  await enviarConReintentos({
    from: `"${clinicaNombre}" <${process.env.EMAIL_USER}>`,
    to: pacienteEmail,
    subject: `Recordatorio — Tienes una cita mañana — ${clinicaNombre}`,
    html: htmlWrapper(contenido, BRAND_PRIMARY)
  })
}

// ─── Email: Recordatorio al doctor ───────────────────────────────────────────
const enviarEmailRecordatorioDoctor = async ({
  doctorEmail,
  doctorNombre,
  pacienteNombre,
  servicio,
  fecha,
  clinicaNombre = BRAND_NAME
}) => {
  const fechaFormateada = new Date(fecha).toLocaleString('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const contenido = `
    <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 22px; font-weight: 800;">
      Cita programada para mañana
    </h2>

    <p style="margin: 0 0 28px; color: #64748b; font-size: 15px; line-height: 1.7;">
      Estimado <strong style="color: #1e293b;">Dr. ${doctorNombre}</strong>, le recordamos que tiene una cita agendada para mañana.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; padding: 4px 20px; margin-bottom: 28px;">
      ${filaDetalle('Fecha y hora', fechaFormateada)}
      ${filaDetalle('Paciente', pacienteNombre)}
      ${filaDetalle('Servicio', servicio)}
    </table>

    <div style="background-color: #ecfdf7; border-left: 4px solid ${BRAND_ACCENT}; padding: 16px 20px; border-radius: 0 12px 12px 0;">
      <p style="margin: 0; color: #006b5a; font-size: 13px; line-height: 1.6;">
        Puede revisar los detalles completos de la cita en su panel médico.
      </p>
    </div>
  `

  await enviarConReintentos({
    from: `"${clinicaNombre}" <${process.env.EMAIL_USER}>`,
    to: doctorEmail,
    subject: `Recordatorio — Cita mañana con ${pacienteNombre} — ${clinicaNombre}`,
    html: htmlWrapper(contenido, BRAND_PRIMARY)
  })
}

module.exports = {
  enviarEmailCitaCreada,
  enviarEmailCambioEstado,
  enviarEmailRecuperacion,
  enviarEmailRecordatorio,
  enviarEmailRecordatorioDoctor
}