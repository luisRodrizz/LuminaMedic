const prisma = require('../prisma/client')
const { cloudinary } = require('../services/cloudinary.service')

const crearClinica = async (req, res) => {
  try {
    const { nombre, direccion, telefono, email } = req.body
    const clinica = await prisma.clinica.create({ data: { nombre, direccion, telefono, email } })
    res.status(201).json({ message: 'Clínica creada correctamente', clinica })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const obtenerClinica = async (req, res) => {
  try {
    const clinica = await prisma.clinica.findFirst()
    res.json(clinica)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const actualizarClinica = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, direccion, telefono, email } = req.body
    const data = { nombre, direccion, telefono, email }

    if (req.file) {
      const clinicaActual = await prisma.clinica.findUnique({ where: { id: parseInt(id) } })
      if (clinicaActual?.logoPublicId) {
        await cloudinary.uploader.destroy(clinicaActual.logoPublicId)
      }
      data.logo = req.file.path
      data.logoPublicId = req.file.filename
    }

    const clinica = await prisma.clinica.update({ where: { id: parseInt(id) }, data })
    res.json({ message: 'Clínica actualizada correctamente', clinica })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

module.exports = { crearClinica, obtenerClinica, actualizarClinica }