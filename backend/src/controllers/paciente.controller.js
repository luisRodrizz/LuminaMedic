const prisma = require('../prisma/client')
const bcrypt = require('bcryptjs')
const { invalidarCacheUsuario } = require('../middlewares/auth.middleware')
const logger = require('../utils/logger')

const crearPaciente = async (req, res) => {
  try {
    const {
      nombre, apellido, email, password, telefono,
      fechaNac, genero, direccion, alergias,
      tipoDocumento, numeroDocumento, fuenteNombre,
      tutorNombre, tutorDni, tutorTelefono
    } = req.body

    const normalizedEmail = email.toLowerCase().trim()

    const usuarioExiste = await prisma.usuario.findUnique({ where: { email: normalizedEmail } })
    if (usuarioExiste) return res.status(400).json({ message: 'El email ya está registrado' })

    const documentoExiste = await prisma.paciente.findUnique({ where: { numeroDocumento } })
    if (documentoExiste) return res.status(400).json({ message: 'El número de documento ya está registrado' })

    // Determinar si es menor de edad
    let esMenor = false
    if (fechaNac) {
      const fecha = new Date(fechaNac)
      const hoy = new Date()
      const edad = hoy.getFullYear() - fecha.getFullYear() -
        (hoy < new Date(hoy.getFullYear(), fecha.getMonth(), fecha.getDate()) ? 1 : 0)
      esMenor = edad < 18

      // Si es menor, validar datos del tutor
      if (esMenor) {
        if (!tutorNombre || !tutorDni || !tutorTelefono) {
          return res.status(400).json({
            message: 'El paciente es menor de edad. Se requieren los datos del tutor: nombre, DNI y teléfono.'
          })
        }
        if (!/^\d{8}$/.test(tutorDni)) {
          return res.status(400).json({ message: 'El DNI del tutor debe tener 8 dígitos' })
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    let validacionReniec = 'PENDIENTE'
    if (tipoDocumento !== 'DNI') {
      validacionReniec = 'NO_APLICA'
    } else if (fuenteNombre === 'RENIEC_API') {
      validacionReniec = 'VALIDADO'
    }

    const usuario = await prisma.usuario.create({
      data: {
        nombre, apellido, email: normalizedEmail, telefono,
        password: hashedPassword,
        role: 'PACIENTE',
        paciente: {
          create: {
            tipoDocumento:    tipoDocumento || 'DNI',
            numeroDocumento,
            fuenteNombre:     fuenteNombre || 'MANUAL',
            validacionReniec,
            fechaNac: fechaNac ? new Date(fechaNac) : null,
            genero, direccion, alergias,
            esMenor,
            tutorNombre:   esMenor ? tutorNombre   : null,
            tutorDni:      esMenor ? tutorDni       : null,
            tutorTelefono: esMenor ? tutorTelefono  : null,
          }
        }
      },
      select: {
        id: true, nombre: true, apellido: true,
        email: true, telefono: true, role: true, paciente: true
      }
    })

    res.status(201).json({ message: 'Paciente registrado correctamente', usuario })
  } catch (error) {
    logger.error('Error creando paciente', { error: error.message })
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const obtenerPacientes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const search = req.query.search || ''

    const where = search ? {
      OR: [
        { usuario: { nombre:   { contains: search, mode: 'insensitive' } } },
        { usuario: { apellido: { contains: search, mode: 'insensitive' } } },
        { usuario: { email:    { contains: search, mode: 'insensitive' } } },
        { numeroDocumento: { contains: search, mode: 'insensitive' } }
      ]
    } : {}

    const [pacientes, total] = await Promise.all([
      prisma.paciente.findMany({
        where, skip, take: limit,
        include: {
          usuario: { select: { nombre: true, apellido: true, email: true, telefono: true, activo: true } }
        }
      }),
      prisma.paciente.count({ where })
    ])

    res.json({
      data: pacientes,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    logger.error('Error obteniendo pacientes', { error: error.message })
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const obtenerPaciente = async (req, res) => {
  try {
    const { id } = req.params
    const paciente = await prisma.paciente.findUnique({
      where: { id: parseInt(id) },
      include: {
        usuario: { select: { nombre: true, apellido: true, email: true, telefono: true, activo: true, createdAt: true } },
        citas: {
          include: {
            servicio: true,
            doctor: { include: { usuario: { select: { nombre: true, apellido: true } } } }
          }
        }
      }
    })
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' })
    res.json(paciente)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const actualizarPaciente = async (req, res) => {
  try {
    const { id } = req.params
    const { fechaNac, genero, direccion, alergias, telefono, esMenor, tutorNombre, tutorDni, tutorTelefono } = req.body
 
    const paciente = await prisma.paciente.findUnique({
      where: { id: parseInt(id) },
      include: { usuario: true }
    })
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' })
 
    // Validar tutor si es menor
    if (esMenor) {
      if (!tutorNombre || !tutorDni || !tutorTelefono) {
        return res.status(400).json({ message: 'Se requieren datos del tutor para pacientes menores de edad' })
      }
      if (!/^\d{8}$/.test(tutorDni)) {
        return res.status(400).json({ message: 'El DNI del tutor debe tener 8 dígitos' })
      }
    }
 
    await prisma.paciente.update({
      where: { id: parseInt(id) },
      data: {
        fechaNac: fechaNac ? new Date(fechaNac) : null,
        genero, direccion, alergias,
        esMenor: esMenor || false,
        tutorNombre:   esMenor ? tutorNombre   : null,
        tutorDni:      esMenor ? tutorDni       : null,
        tutorTelefono: esMenor ? tutorTelefono  : null,
      }
    })
 
    if (telefono) {
      await prisma.usuario.update({
        where: { id: paciente.usuarioId },
        data: { telefono }
      })
    }
 
    res.json({ message: 'Paciente actualizado correctamente' })
  } catch (error) {
    logger.error('Error actualizando paciente', { error: error.message })
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const eliminarPaciente = async (req, res) => {
  try {
    const { id } = req.params
    const paciente = await prisma.paciente.findUnique({
      where: { id: parseInt(id) },
      include: { usuario: true }
    })
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' })

    await prisma.usuario.update({
      where: { id: paciente.usuarioId },
      data: { activo: !paciente.usuario.activo }
    })

    // Invalidar caché Redis — efecto inmediato
    await invalidarCacheUsuario(paciente.usuarioId)

    res.json({ message: `Paciente ${paciente.usuario.activo ? 'desactivado' : 'activado'} correctamente` })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const consultarDni = async (req, res) => {
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
      numeroDocumento: data.dni,
      nombres: data.nombres,
      apellido_paterno: data.apellido_paterno,
      apellido_materno: data.apellido_materno
    })
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar el DNI' })
  }
}

// ─── Perfil propio del paciente autenticado ───────────────────────────────────

const obtenerMiPerfil = async (req, res) => {
  try {
    const usuarioId = req.user.id

    const paciente = await prisma.paciente.findUnique({
      where: { usuarioId },
      include: {
        usuario: {
          select: {
            nombre: true, apellido: true, email: true,
            telefono: true, activo: true, createdAt: true
          }
        },
        citas: { select: { id: true } }
      }
    })

    if (!paciente) return res.status(404).json({ message: 'Perfil no encontrado' })

    res.json(paciente)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const actualizarMiPerfil = async (req, res) => {
  try {
    const usuarioId = req.user.id
    const { telefono, fechaNac, genero, direccion, alergias } = req.body

    const paciente = await prisma.paciente.findUnique({ where: { usuarioId } })
    if (!paciente) return res.status(404).json({ message: 'Perfil no encontrado' })

    // Foto nueva via Cloudinary
    let fotoData = {}
    if (req.file) {
      if (paciente.fotoPublicId) {
        const { cloudinary } = require('../services/cloudinary.service')
        await cloudinary.uploader.destroy(paciente.fotoPublicId)
      }
      fotoData = {
        foto: req.file.path,
        fotoPublicId: req.file.filename
      }
    }

    await prisma.paciente.update({
      where: { usuarioId },
      data: {
        fechaNac: fechaNac ? new Date(fechaNac) : paciente.fechaNac,
        genero:   genero   !== undefined ? genero   : paciente.genero,
        direccion: direccion !== undefined ? direccion : paciente.direccion,
        alergias: alergias  !== undefined ? alergias  : paciente.alergias,
        ...fotoData
      }
    })

    if (telefono !== undefined) {
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: { telefono }
      })
    }

    res.json({ message: 'Perfil actualizado correctamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

module.exports = {
  crearPaciente, obtenerPacientes, obtenerPaciente,
  actualizarPaciente, eliminarPaciente, consultarDni,
  obtenerMiPerfil, actualizarMiPerfil
}