const express = require('express')
const router = express.Router()
const {
  crearPaciente, obtenerPacientes, obtenerPaciente,
  actualizarPaciente, eliminarPaciente, consultarDni,
  obtenerMiPerfil, actualizarMiPerfil
} = require('../controllers/paciente.controller')
const { verifyToken, verifyRole } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { pacienteSchema } = require('../validations/paciente.validation')
const logger = require('../middlewares/logger.middleware')
const { uploadPaciente } = require('../middlewares/upload.middleware')
const { dniLimiter, registerLimiter } = require('../middlewares/rateLimit.middleware')


router.get('/perfil/me', verifyToken, verifyRole('PACIENTE'), obtenerMiPerfil)
router.put('/perfil/me', verifyToken, verifyRole('PACIENTE'), uploadPaciente.single('foto'), logger('ACTUALIZAR_MI_PERFIL'), actualizarMiPerfil)

router.get('/documento/:dni', verifyToken, verifyRole('ADMIN'), dniLimiter, consultarDni)
router.post('/', verifyToken, verifyRole('ADMIN'), registerLimiter, validate(pacienteSchema), logger('CREAR_PACIENTE'), crearPaciente)
router.get('/',    verifyToken, verifyRole('ADMIN', 'DOCTOR'), obtenerPacientes)
router.get('/:id', verifyToken, verifyRole('ADMIN', 'DOCTOR'), obtenerPaciente)
router.put('/:id', verifyToken, verifyRole('ADMIN'), logger('ACTUALIZAR_PACIENTE'), actualizarPaciente)
router.delete('/:id', verifyToken, verifyRole('ADMIN'), logger('DESACTIVAR_PACIENTE'), eliminarPaciente)

module.exports = router