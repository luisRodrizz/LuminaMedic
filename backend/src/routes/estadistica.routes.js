const express = require('express')
const router = express.Router()
const { getEstadisticas, getEstadisticasDoctor, getEstadisticasPaciente } = require('../controllers/estadistica.controller')
const { verifyToken, verifyRole } = require('../middlewares/auth.middleware')

router.get('/',       verifyToken, verifyRole('ADMIN'),  getEstadisticas)
router.get('/doctor', verifyToken, verifyRole('DOCTOR'), getEstadisticasDoctor) // ← nueva línea
router.get('/paciente', verifyToken, verifyRole('PACIENTE'), getEstadisticasPaciente) // ← nueva línea

module.exports = router