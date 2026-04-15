const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma/client')
const crypto = require('crypto')
const zxcvbn = require('zxcvbn')
const { enviarEmailRecuperacion } = require('../services/email.service')

const register = async (req, res) => {
  try {
    const { nombre, apellido, email, password, telefono, tipoDocumento, numeroDocumento, fuenteNombre } = req.body
    const normalizedEmail = email.toLowerCase().trim()
 
    // Verificar email duplicado
    const usuarioExiste = await prisma.usuario.findUnique({ where: { email: normalizedEmail } })
    if (usuarioExiste) {
      return res.status(400).json({ message: 'El email ya está registrado' })
    }
 
    // Verificar documento duplicado
    if (numeroDocumento) {
      const documentoExiste = await prisma.paciente.findUnique({ where: { numeroDocumento } })
      if (documentoExiste) {
        return res.status(400).json({ message: 'El número de documento ya está registrado' })
      }
    }
 
    const hashedPassword = await bcrypt.hash(password, 10)
 
    let validacionReniec = 'PENDIENTE'
    if (tipoDocumento && tipoDocumento !== 'DNI') {
      validacionReniec = 'NO_APLICA'
    } else if (fuenteNombre === 'RENIEC_API') {
      validacionReniec = 'VALIDADO'
    }
 
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        email: normalizedEmail,
        password: hashedPassword,
        telefono,
        role: 'PACIENTE',
        paciente: {
          create: {
            tipoDocumento:   tipoDocumento || 'DNI',
            numeroDocumento: numeroDocumento || null,
            fuenteNombre:    fuenteNombre || 'MANUAL',
            validacionReniec
          }
        }
      }
    })
 
    res.status(201).json({
      message: 'Usuario registrado correctamente',
      usuario: {
        id:     usuario.id,
        nombre: usuario.nombre,
        email:  usuario.email,
        role:   usuario.role
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const normalizedEmail = email.toLowerCase().trim()

    const usuario = await prisma.usuario.findUnique({ where: { email: normalizedEmail } })
    if (!usuario) {
      return res.status(400).json({ message: 'Credenciales incorrectas' })
    }

    if (!usuario.activo) {
      return res.status(403).json({ message: 'Tu cuenta está desactivada' })
    }

    const passwordValido = await bcrypt.compare(password, usuario.password)
    if (!passwordValido) {
      return res.status(400).json({ message: 'Credenciales incorrectas' })
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        role: usuario.role
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const solicitarRecuperacion = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'El email es requerido' })

    const normalizedEmail = email.toLowerCase().trim()
    const usuario = await prisma.usuario.findUnique({ where: { email: normalizedEmail } })

    const respuestaGenerica = { message: 'Si el correo está registrado, recibirás un email con instrucciones.' }

    if (!usuario) return res.json(respuestaGenerica)
    if (usuario.role === 'ADMIN') return res.json(respuestaGenerica)
    if (!usuario.activo) return res.json(respuestaGenerica)

    await prisma.tokenRecuperacion.updateMany({
      where: { usuarioId: usuario.id, usado: false },
      data: { usado: true }
    })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

    await prisma.tokenRecuperacion.create({
      data: { token, usuarioId: usuario.id, expiresAt }
    })

    enviarEmailRecuperacion({
      email: usuario.email,
      nombre: usuario.nombre,
      token
    }).catch(err => logger.error('Error enviando email recuperación', { error: err.message }))

    res.json(respuestaGenerica)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const resetearPassword = async (req, res) => {
  try {
    const { token, password } = req.body
 
    if (!token || !password) {
      return res.status(400).json({ message: 'Token y contraseña son requeridos' })
    }
 
    if (password.length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' })
    }
 
    const fortaleza = zxcvbn(password)
    if (fortaleza.score < 2) {
      return res.status(400).json({
        message: 'La contraseña es muy común o débil. Usa una combinación de letras, números y símbolos.'
      })
    }
 
    const tokenRecord = await prisma.tokenRecuperacion.findUnique({
      where: { token },
      include: { usuario: true }
    })
 
    if (!tokenRecord) {
      return res.status(400).json({ message: 'Token inválido o expirado' })
    }
 
    if (tokenRecord.usado) {
      return res.status(400).json({ message: 'Este link ya fue utilizado' })
    }
 
    if (new Date() > tokenRecord.expiresAt) {
      return res.status(400).json({ message: 'El link ha expirado. Solicita uno nuevo.' })
    }
 
    if (!tokenRecord.usuario.activo) {
      return res.status(400).json({ message: 'Token inválido o expirado' })
    }
 
    const hashedPassword = await bcrypt.hash(password, 10)
 
    await prisma.$transaction([
      prisma.usuario.update({
        where: { id: tokenRecord.usuarioId },
        data: { password: hashedPassword }
      }),
      prisma.tokenRecuperacion.update({
        where: { id: tokenRecord.id },
        data: { usado: true }
      })
    ])
 
    res.json({ message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}
 
const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body
 
    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' })
    }
 
    if (passwordNueva.length < 8) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 8 caracteres' })
    }
 
    const fortaleza = zxcvbn(passwordNueva)
    if (fortaleza.score < 2) {
      return res.status(400).json({
        message: 'La contraseña es muy común o débil. Usa una combinación de letras, números y símbolos.'
      })
    }
 
    if (passwordActual === passwordNueva) {
      return res.status(400).json({ message: 'La nueva contraseña debe ser diferente a la actual' })
    }
 
    const usuario = await prisma.usuario.findUnique({ where: { id: req.user.id } })
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' })
 
    const passwordValido = await bcrypt.compare(passwordActual, usuario.password)
    if (!passwordValido) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta' })
    }
 
    const hashedPassword = await bcrypt.hash(passwordNueva, 10)
 
    await prisma.usuario.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    })
 
    res.json({ message: 'Contraseña actualizada correctamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Consulta DNI pública — para el registro sin token
const consultarDniPublico = async (req, res) => {
  try {
    const { dni } = req.params
 
    if (!/^\d{8}$/.test(dni)) {
      return res.status(400).json({ message: 'El DNI debe tener 8 dígitos' })
    }
 
    const response = await fetch(
      `https://peruapi.com/api/dni/${dni}?api_token=${process.env.PERUAPI_KEY}`
    )
    const data = await response.json()
 
    if (data.code !== '200') {
      return res.status(404).json({ message: 'DNI no encontrado' })
    }
 
    res.json({
      numeroDocumento:  data.dni,
      nombres:          data.nombres,
      apellido_paterno: data.apellido_paterno,
      apellido_materno: data.apellido_materno
    })
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar el DNI' })
  }
}

module.exports = { register, login, solicitarRecuperacion, resetearPassword, cambiarPassword, consultarDniPublico }