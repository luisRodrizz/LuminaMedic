const prisma = require('../prisma/client')

const crearServicio = async (req, res) => {
  try {
    const { nombre, precio, duracion, clinicaId } = req.body

    const servicio = await prisma.servicio.create({
      data: { nombre, precio: parseFloat(precio), duracion: parseInt(duracion), clinicaId: parseInt(clinicaId) }
    })

    res.status(201).json({ message: 'Servicio creado correctamente', servicio })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const obtenerServicios = async (req, res) => {
  try {
    const servicios = await prisma.servicio.findMany({
      include: { clinica: { select: { nombre: true } } }
    })
    res.json(servicios)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, precio, duracion } = req.body

    const servicio = await prisma.servicio.update({
      where: { id: parseInt(id) },
      data: { nombre, precio: parseFloat(precio), duracion: parseInt(duracion) }
    })

    res.json({ message: 'Servicio actualizado correctamente', servicio })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

const eliminarServicio = async (req, res) => {
  try {
    const { id } = req.params

    const servicio = await prisma.servicio.findUnique({ where: { id: parseInt(id) } })
    if (!servicio) return res.status(404).json({ message: 'Servicio no encontrado' })

    await prisma.servicio.update({
      where: { id: parseInt(id) },
      data: { activo: !servicio.activo }
    })

    res.json({ message: `Servicio ${servicio.activo ? 'desactivado' : 'activado'} correctamente` })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

module.exports = { crearServicio, obtenerServicios, actualizarServicio, eliminarServicio }