const express = require('express')
const router = express.Router()
const {
  crearDoctor, obtenerDoctores, obtenerDoctor,
  actualizarDoctor, eliminarDoctor, consultarDniDoctor,
  obtenerMiPerfil, actualizarMiPerfil
} = require('../controllers/doctor.controller')
const { verifyToken, verifyRole } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { doctorSchema } = require('../validations/doctor.validation')
const logger = require('../middlewares/logger.middleware')
const { uploadDoctor } = require('../middlewares/upload.middleware')
const { dniLimiter } = require('../middlewares/rateLimit.middleware')

router.get('/perfil/me', verifyToken, verifyRole('DOCTOR'), obtenerMiPerfil)
router.put('/perfil/me', verifyToken, verifyRole('DOCTOR'), uploadDoctor.single('foto'), logger('ACTUALIZAR_MI_PERFIL'), actualizarMiPerfil)

router.get('/dni/:dni', verifyToken, verifyRole('ADMIN'), dniLimiter, consultarDniDoctor)
router.post('/',   verifyToken, verifyRole('ADMIN'), validate(doctorSchema), logger('CREAR_DOCTOR'), crearDoctor)
router.get('/', verifyToken, verifyRole('ADMIN', 'PACIENTE'), obtenerDoctores)
router.get('/:id', verifyToken, verifyRole('ADMIN'), obtenerDoctor)
router.put('/:id', verifyToken, verifyRole('ADMIN'), logger('ACTUALIZAR_DOCTOR'), actualizarDoctor)
router.delete('/:id', verifyToken, verifyRole('ADMIN'), logger('ELIMINAR_DOCTOR'), eliminarDoctor)

module.exports = router