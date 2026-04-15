const express = require('express')
const router = express.Router()
const { crearServicio, obtenerServicios, actualizarServicio, eliminarServicio } = require('../controllers/servicio.controller')
const { verifyToken, verifyRole } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { servicioSchema } = require('../validations/servicio.validation')

router.post('/', verifyToken, verifyRole('ADMIN'), validate(servicioSchema), crearServicio)
router.get('/', verifyToken, obtenerServicios)
router.put('/:id', verifyToken, verifyRole('ADMIN'), actualizarServicio)
router.delete('/:id', verifyToken, verifyRole('ADMIN'), eliminarServicio)

module.exports = router