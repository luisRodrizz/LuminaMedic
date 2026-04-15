const express = require('express')
const router = express.Router()
const {
  reportePacientes, reporteCitas,
  reportePagosPeriodo, reporteRendimientoDoctor,
  reporteCitaIndividual, reportePagoIndividual
} = require('../controllers/reporte.controller')
const { verifyToken, verifyRole } = require('../middlewares/auth.middleware')

router.get('/pacientes',       verifyToken, verifyRole('ADMIN'), reportePacientes)
router.get('/citas',           verifyToken, verifyRole('ADMIN'), reporteCitas)
router.get('/pagos',           verifyToken, verifyRole('ADMIN'), reportePagosPeriodo)
router.get('/rendimiento',     verifyToken, verifyRole('ADMIN'), reporteRendimientoDoctor)
router.get('/cita/:id',        verifyToken, verifyRole('ADMIN'), reporteCitaIndividual)
router.get('/pago/:id',        verifyToken, verifyRole('ADMIN'), reportePagoIndividual)

module.exports = router