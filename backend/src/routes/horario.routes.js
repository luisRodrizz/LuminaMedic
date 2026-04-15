const express = require('express')
const router = express.Router()
const {
  obtenerHorarios, obtenerMisHorarios,
  crearHorario, actualizarHorario, eliminarHorario,
  obtenerSlotsDisponibles
} = require('../controllers/horario.controller')
const { obtenerBloqueos, obtenerMisBloqueos, crearBloqueo, eliminarBloqueo } = require('../controllers/bloqueo.controller')
const { verifyToken, verifyRole } = require('../middlewares/auth.middleware')
const logger = require('../middlewares/logger.middleware')

// Slots disponibles — paciente al agendar
router.get('/slots', verifyToken, obtenerSlotsDisponibles)

// Doctor — sus propios horarios y bloqueos
router.get('/me',          verifyToken, verifyRole('DOCTOR'), obtenerMisHorarios)
router.get('/me/bloqueos', verifyToken, verifyRole('DOCTOR'), obtenerMisBloqueos)

// Admin — bloqueos (más específico primero)
router.get('/bloqueos/:id',          verifyToken, verifyRole('ADMIN'), obtenerBloqueos)
router.get('/:doctorId/bloqueos',    verifyToken, verifyRole('ADMIN'), obtenerBloqueos)
router.post('/bloqueos',             verifyToken, verifyRole('ADMIN'), logger('CREAR_BLOQUEO'),      crearBloqueo)
router.delete('/bloqueos/:id',       verifyToken, verifyRole('ADMIN'), logger('ELIMINAR_BLOQUEO'),   eliminarBloqueo)

// Admin — horarios (más genérico al final)
router.get('/:doctorId',             verifyToken, verifyRole('ADMIN'), obtenerHorarios)
router.post('/',                     verifyToken, verifyRole('ADMIN'), logger('CREAR_HORARIO'),      crearHorario)
router.put('/:id',                   verifyToken, verifyRole('ADMIN'), logger('ACTUALIZAR_HORARIO'), actualizarHorario)
router.delete('/:id',                verifyToken, verifyRole('ADMIN'), logger('ELIMINAR_HORARIO'),   eliminarHorario)

module.exports = router