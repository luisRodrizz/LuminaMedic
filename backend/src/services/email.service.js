const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// ─── Exponential backoff helper ───────────────────────────────────────────────
const enviarConReintentos = async (opciones, intentos = 3) => {
  for (let i = 0; i < intentos; i++) {
    try {
      await transporter.sendMail(opciones)
      return
    } catch (error) {
      const esUltimoIntento = i === intentos - 1
      if (esUltimoIntento) {
        console.error(`Email fallido tras ${intentos} intentos:`, error.message)
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
  maxWidth: '600px',
}

const htmlWrapper = (contenido, colorHeader = '#1e3a5f') => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: ${estiloBase.fontFamily};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: ${estiloBase.maxWidth}; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: ${colorHeader}; padding: 36px 40px;">
              <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600;">Sistema Clínico</p>
              <h1 style="margin: 8px 0 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px;">MediCare</h1>
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
                Si tienes dudas, contáctanos directamente a través de nuestros canales oficiales.
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
  <span style="display: inline-block; padding: 4px 12px; background-color: ${color}15; color: ${color}; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.3px;">${texto}</span>
`

const filaDetalle = (label, valor) => `
  <tr>
    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
      <p style="margin: 0; color: #94a3b8; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;">${label}</p>
      <p style="margin: 4px 0 0; color: #1e293b; font-size: 15px; font-weight: 500;">${valor}</p>
    </td>
  </tr>
`

// ─── Email: Cita creada ───────────────────────────────────────────────────────
const enviarEmailCitaCreada = async ({ pacienteEmail, pacienteNombre, doctorNombre, servicio, fecha }) => {
  const fechaFormateada = new Date(fecha).toLocaleString('es-PE', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const contenido = `
    <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 20px; font-weight: 700;">Cita confirmada</h2>
    <p style="margin: 0 0 28px; color: #64748b; font-size: 15px; line-height: 1.6;">
      Hola <strong style="color: #1e293b;">${pacienteNombre}</strong>, tu cita ha sido agendada exitosamente.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; padding: 4px 20px; margin-bottom: 28px;">
      ${filaDetalle('Fecha y hora', fechaFormateada)}
      ${filaDetalle('Médico', `Dr. ${doctorNombre}`)}
      ${filaDetalle('Servicio', servicio)}
    </table>

    <div style="background-color: #eff6ff; border-left: 3px solid #3b82f6; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 8px;">
      <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.6;">
        <strong>Recuerda:</strong> Te recomendamos llegar 10 minutos antes de tu cita. Si necesitas cancelar o reprogramar, hazlo con anticipación.
      </p>
    </div>
  `

  await enviarConReintentos({
    from: `"MediCare" <${process.env.EMAIL_USER}>`,
    to: pacienteEmail,
    subject: 'Cita confirmada — MediCare',
    html: htmlWrapper(contenido, '#1e3a5f')
  })
}

// ─── Email: Cambio de estado ──────────────────────────────────────────────────
const enviarEmailCambioEstado = async ({ pacienteEmail, pacienteNombre, estado, servicio, fecha }) => {
  const fechaFormateada = new Date(fecha).toLocaleString('es-PE', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const estadoInfo = {
    CONFIRMADA:   { texto: 'Confirmada',   color: '#2563eb', header: '#1e3a5f', mensaje: 'Tu cita ha sido confirmada.'                                    },
    CANCELADA:    { texto: 'Cancelada',    color: '#dc2626', header: '#7f1d1d', mensaje: 'Tu cita ha sido cancelada.'                                     },
    COMPLETADA:   { texto: 'Completada',   color: '#16a34a', header: '#14532d', mensaje: 'Tu consulta ha sido completada. Puedes ver tu historial clínico.' },
    PENDIENTE:    { texto: 'Pendiente',    color: '#d97706', header: '#78350f', mensaje: 'Tu cita está en estado pendiente.'                               },
    REPROGRAMADA: { texto: 'Reprogramada', color: '#7c3aed', header: '#4c1d95', mensaje: 'Tu cita ha sido reprogramada a una nueva fecha.'                 },
  }

  const info = estadoInfo[estado] || { texto: estado, color: '#475569', header: '#1e293b', mensaje: 'El estado de tu cita ha sido actualizado.' }

  const contenido = `
    <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 20px; font-weight: 700;">Actualización de cita</h2>
    <p style="margin: 0 0 20px; color: #64748b; font-size: 15px; line-height: 1.6;">
      Hola <strong style="color: #1e293b;">${pacienteNombre}</strong>, te informamos sobre un cambio en tu cita.
    </p>

    <div style="margin-bottom: 24px;">
      <p style="margin: 0 0 8px; color: #94a3b8; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;">Estado actual</p>
      ${badge(info.texto, info.color)}
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; padding: 4px 20px; margin-bottom: 24px;">
      ${filaDetalle('Servicio', servicio)}
      ${filaDetalle('Fecha', fechaFormateada)}
    </table>

    <div style="background-color: #f8fafc; border-left: 3px solid ${info.color}; padding: 16px 20px; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.6;">${info.mensaje}</p>
    </div>
  `

  await enviarConReintentos({
    from: `"MediCare" <${process.env.EMAIL_USER}>`,
    to: pacienteEmail,
    subject: `Cita ${info.texto.toLowerCase()} — MediCare`,
    html: htmlWrapper(contenido, info.header)
  })
}

// ─── Email: Recuperación de contraseña ───────────────────────────────────────
const enviarEmailRecuperacion = async ({ email, nombre, token }) => {
  const urlRecuperacion = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

  const contenido = `
    <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 20px; font-weight: 700;">Recuperación de contraseña</h2>
    <p style="margin: 0 0 28px; color: #64748b; font-size: 15px; line-height: 1.6;">
      Hola <strong style="color: #1e293b;">${nombre}</strong>, recibimos una solicitud para restablecer la contraseña de tu cuenta.
    </p>

    <div style="text-align: center; margin-bottom: 28px;">
      <a href="${urlRecuperacion}"
        style="display: inline-block; background-color: #1e3a5f; color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.3px;">
        Restablecer contraseña
      </a>
    </div>

    <div style="background-color: #fffbeb; border-left: 3px solid #f59e0b; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
      <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
        <strong>Este enlace expira en 30 minutos.</strong> Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.
      </p>
    </div>

    <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
      Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
      <a href="${urlRecuperacion}" style="color: #3b82f6; word-break: break-all;">${urlRecuperacion}</a>
    </p>
  `

  await enviarConReintentos({
    from: `"MediCare" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Restablece tu contraseña — MediCare',
    html: htmlWrapper(contenido, '#1e3a5f')
  })
}

// ─── Email: Recordatorio al paciente ─────────────────────────────────────────
const enviarEmailRecordatorio = async ({
  pacienteEmail, pacienteNombre, doctorNombre, servicio, fecha,
  clinicaNombre = 'MediCare', clinicaDireccion = '', clinicaTelefono = ''
}) => {
  const fechaFormateada = new Date(fecha).toLocaleString('es-PE', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const contenido = `
    <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 20px; font-weight: 700;">Recordatorio de cita</h2>
    <p style="margin: 0 0 28px; color: #64748b; font-size: 15px; line-height: 1.6;">
      Hola <strong style="color: #1e293b;">${pacienteNombre}</strong>, te recordamos que tienes una cita programada para <strong style="color: #1e293b;">mañana</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; padding: 4px 20px; margin-bottom: 28px;">
      ${filaDetalle('Fecha y hora', fechaFormateada)}
      ${filaDetalle('Médico', `Dr. ${doctorNombre}`)}
      ${filaDetalle('Servicio', servicio)}
      ${clinicaDireccion ? filaDetalle('Dirección', clinicaDireccion) : ''}
      ${clinicaTelefono  ? filaDetalle('Teléfono clínica', clinicaTelefono) : ''}
    </table>

    <div style="background-color: #f0fdf4; border-left: 3px solid #16a34a; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 8px;">
      <p style="margin: 0; color: #15803d; font-size: 13px; line-height: 1.6;">
        <strong>Recuerda:</strong> Llega 10 minutos antes. Si necesitas cancelar o reprogramar, contáctanos con anticipación.
      </p>
    </div>
  `

  await enviarConReintentos({
    from: `"${clinicaNombre}" <${process.env.EMAIL_USER}>`,
    to: pacienteEmail,
    subject: `Recordatorio — Tienes una cita mañana — ${clinicaNombre}`,
    html: htmlWrapper(contenido, '#14532d')
  })
}

// ─── Email: Recordatorio al doctor ───────────────────────────────────────────
const enviarEmailRecordatorioDoctor = async ({
  doctorEmail, doctorNombre, pacienteNombre, servicio, fecha,
  clinicaNombre = 'MediCare'
}) => {
  const fechaFormateada = new Date(fecha).toLocaleString('es-PE', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const contenido = `
    <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 20px; font-weight: 700;">Cita programada para mañana</h2>
    <p style="margin: 0 0 28px; color: #64748b; font-size: 15px; line-height: 1.6;">
      Estimado <strong style="color: #1e293b;">Dr. ${doctorNombre}</strong>, le recordamos que tiene una cita agendada para mañana.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; padding: 4px 20px; margin-bottom: 28px;">
      ${filaDetalle('Fecha y hora', fechaFormateada)}
      ${filaDetalle('Paciente', pacienteNombre)}
      ${filaDetalle('Servicio', servicio)}
    </table>

    <div style="background-color: #eff6ff; border-left: 3px solid #3b82f6; padding: 16px 20px; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.6;">
        Puede revisar los detalles completos de la cita en su panel médico.
      </p>
    </div>
  `

  await enviarConReintentos({
    from: `"${clinicaNombre}" <${process.env.EMAIL_USER}>`,
    to: doctorEmail,
    subject: `Recordatorio — Cita mañana con ${pacienteNombre} — ${clinicaNombre}`,
    html: htmlWrapper(contenido, '#1e3a5f')
  })
}

module.exports = {
  enviarEmailCitaCreada,
  enviarEmailCambioEstado,
  enviarEmailRecuperacion,
  enviarEmailRecordatorio,
  enviarEmailRecordatorioDoctor
}