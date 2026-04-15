const express = require('express')
const router = express.Router()
const { 
  obtenerNotificaciones, marcarLeida, marcarTodasLeidas,
  obtenerNotificacionesPaciente, marcarLeidaPaciente, marcarTodasLeidasPaciente
} = require('../controllers/notificacion.controller')
const { verifyToken, verifyRole } = require('../middlewares/auth.middleware')

// Doctor
router.get('/',             verifyToken, verifyRole('DOCTOR'),   obtenerNotificaciones)
router.patch('/:id/leer',   verifyToken, verifyRole('DOCTOR'),   marcarLeida)
router.patch('/leer-todas', verifyToken, verifyRole('DOCTOR'),   marcarTodasLeidas)

// Paciente
router.get('/paciente',              verifyToken, verifyRole('PACIENTE'), obtenerNotificacionesPaciente)
router.patch('/paciente/leer-todas', verifyToken, verifyRole('PACIENTE'), marcarTodasLeidasPaciente)
router.patch('/paciente/:id/leer',   verifyToken, verifyRole('PACIENTE'), marcarLeidaPaciente)

module.exports = router