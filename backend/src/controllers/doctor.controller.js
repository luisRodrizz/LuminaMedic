const prisma = require('../prisma/client')
const bcrypt = require('bcryptjs')
const { invalidarCacheUsuario } = require('../middlewares/auth.middleware')
const logger = require('../utils/logger')

const crearDoctor = async (req, res) => {
  try {
    const { nombre, apellido, email, password, telefono, especialidad, descripcion, clinicaId, tipoDocumento, numeroDocumento, fuenteNombre } = req.body
    const normalizedEmail = email.toLowerCase().trim()

    const usuarioExiste = await prisma.usuario.findUnique({ where: { email: normalizedEmail } })
    if (usuarioExiste) {
      return res.status(400).json({ message: 'El email ya está registrado' })
    }

    if (numeroDocumento) {
      const documentoExiste = await prisma.doctor.findUnique({ where: { numeroDocumento } })
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
        nombre, apellido, email: normalizedEmail, telefono,
        password: hashedPassword,
        role: 'DOCTOR',
        doctor: {
          create: {
            especialidad, descripcion,
            clinicaId: parseInt(clinicaId),
            tipoDocumento:    tipoDocumento || 'DNI',
            numeroDocumento:  numeroDocumento || null,
            fuenteNombre:     fuenteNombre || 'MANUAL',
            validacionReniec
          }
        }
      },
      select: {
        id: true, nombre: true, apellido: true,
        email: true, telefono: true, role: true, doctor: true
      }
    })

    res.status(201).json({ message: 'Doctor creado correctamente', usuario })
    } catch (error) {
    logger.error('Error creando doctor', { error: error.message })
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const obtenerDoctores = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const search = req.query.search || ''

    const where = search ? {
      OR: [
        { especialidad:      { contains: search, mode: 'insensitive' } },
        { numeroDocumento:   { contains: search, mode: 'insensitive' } },
        { usuario: { nombre:   { contains: search, mode: 'insensitive' } } },
        { usuario: { apellido: { contains: search, mode: 'insensitive' } } }
      ]
    } : {}

    const [doctores, total] = await Promise.all([
      prisma.doctor.findMany({
        where, skip, take: limit,
        include: {
          usuario: { select: { nombre: true, apellido: true, email: true, telefono: true, activo: true } },
          clinica: { select: { nombre: true } }
        }
      }),
      prisma.doctor.count({ where })
    ])

    res.json({
      data: doctores,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const obtenerDoctor = async (req, res) => {
  try {
    const { id } = req.params
    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(id) },
      include: {
        usuario: { select: { nombre: true, apellido: true, email: true, telefono: true, activo: true, createdAt: true } },
        clinica: { select: { nombre: true } },
        citas: {
          include: {
            paciente: { include: { usuario: { select: { nombre: true, apellido: true } } } },
            servicio: { select: { nombre: true } }
          },
          orderBy: { fecha: 'desc' }
        }
      }
    })
    if (!doctor) return res.status(404).json({ message: 'Doctor no encontrado' })
    res.json(doctor)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const actualizarDoctor = async (req, res) => {
  try {
    const { id } = req.params
    const { especialidad, descripcion, nombre, apellido, telefono } = req.body

    const doctor = await prisma.doctor.update({
      where: { id: parseInt(id) },
      data: { especialidad, descripcion }
    })

    await prisma.usuario.update({
      where: { id: doctor.usuarioId },
      data: { nombre, apellido, telefono }
    })

    res.json({ message: 'Doctor actualizado correctamente', doctor })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const eliminarDoctor = async (req, res) => {
  try {
    const { id } = req.params
    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(id) },
      include: { usuario: true }
    })
    if (!doctor) return res.status(404).json({ message: 'Doctor no encontrado' })

    await prisma.usuario.update({
      where: { id: doctor.usuarioId },
      data: { activo: !doctor.usuario.activo }
    })

    // Invalidar caché Redis — efecto inmediato
    await invalidarCacheUsuario(doctor.usuarioId)

    res.json({ message: `Doctor ${doctor.usuario.activo ? 'desactivado' : 'activado'} correctamente` })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const consultarDniDoctor = async (req, res) => {
  try {
    const { dni } = req.params

    if (!/^\d{8}$/.test(dni)) {
      return res.status(400).json({ message: 'El DNI debe tener 8 dígitos' })
    }

    const response = await fetch(
      `https://peruapi.com/api/dni/${dni}?api_token=${process.env.PERUAPI_KEY}`
    )

    const data = await response.json()

    console.log('PeruAPI response =>', JSON.stringify({
      dni,
      httpStatus: response.status,
      data
    }, null, 2))

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
    logger.error('Error al consultar DNI', { error: error.message })
    res.status(500).json({ message: 'Error al consultar el DNI' })
  }
}

// ─── Perfil propio del doctor autenticado ─────────────────────────────────────

const obtenerMiPerfil = async (req, res) => {
  try {
    const usuarioId = req.user.id

    const doctor = await prisma.doctor.findUnique({
      where: { usuarioId },
      include: {
        usuario: {
          select: {
            nombre: true, apellido: true, email: true,
            telefono: true, activo: true, createdAt: true
          }
        },
        clinica: { select: { nombre: true, direccion: true } },
        citas: { select: { id: true } }
      }
    })

    if (!doctor) return res.status(404).json({ message: 'Perfil de doctor no encontrado' })

    res.json(doctor)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const actualizarMiPerfil = async (req, res) => {
  try {
    const usuarioId = req.user.id
    const { telefono, especialidad, descripcion } = req.body

    const doctor = await prisma.doctor.findUnique({ where: { usuarioId } })
    if (!doctor) return res.status(404).json({ message: 'Perfil de doctor no encontrado' })

    // Si viene foto nueva via Cloudinary
    let fotoData = {}
    if (req.file) {
      if (doctor.fotoPublicId) {
        const { cloudinary } = require('../services/cloudinary.service')
        await cloudinary.uploader.destroy(doctor.fotoPublicId)
      }
      fotoData = {
        foto: req.file.path,
        fotoPublicId: req.file.filename
      }
    }

    const doctorActualizado = await prisma.doctor.update({
      where: { usuarioId },
      data: {
        especialidad: especialidad || doctor.especialidad,
        descripcion,
        ...fotoData
      }
    })

    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { telefono }
    })

    res.json({ message: 'Perfil actualizado correctamente', doctor: doctorActualizado })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

module.exports = {
  crearDoctor, obtenerDoctores, obtenerDoctor,
  actualizarDoctor, eliminarDoctor, consultarDniDoctor,
  obtenerMiPerfil, actualizarMiPerfil
}