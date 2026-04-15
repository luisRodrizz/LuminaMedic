const express = require('express')
const router = express.Router()
const { crearCita, obtenerCitas, obtenerCita, actualizarEstadoCita, agregarNotaClinica, cancelarCita, citasHoy, reprogramarCita } = require('../controllers/cita.controller')
const { verifyToken, verifyRole } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { citaSchema, estadoSchema } = require('../validations/cita.validation')
const logger = require('../middlewares/logger.middleware')
const { notaLimiter } = require('../middlewares/rateLimit.middleware')

router.get('/hoy',               verifyToken, verifyRole('ADMIN'), citasHoy)
router.post('/',                 verifyToken, verifyRole('ADMIN', 'PACIENTE'), validate(citaSchema), logger('CREAR_CITA'), crearCita)
router.get('/',                  verifyToken, obtenerCitas)
router.get('/:id',               verifyToken, obtenerCita)
router.patch('/:id/estado',      verifyToken, verifyRole('ADMIN', 'DOCTOR'), validate(estadoSchema), logger('CAMBIAR_ESTADO_CITA'), actualizarEstadoCita)
router.post('/:id/nota', verifyToken, verifyRole('DOCTOR'), notaLimiter, logger('AGREGAR_NOTA'), agregarNotaClinica)
router.patch('/:id/cancelar',    verifyToken, verifyRole('PACIENTE'), logger('CANCELAR_CITA'), cancelarCita)
router.patch('/:id/reprogramar', verifyToken, verifyRole('PACIENTE'), reprogramarCita)

module.exports = router