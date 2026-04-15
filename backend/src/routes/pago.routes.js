const express = require('express')
const router = express.Router()
const { registrarPago, obtenerPagos, obtenerResumenPagos, reportePagosPDF, obtenerMisPagos } = require('../controllers/pago.controller')
const { verifyToken, verifyRole } = require('../middlewares/auth.middleware')

router.post('/',          verifyToken, verifyRole('ADMIN'),    registrarPago)
router.get('/',           verifyToken, verifyRole('ADMIN'),    obtenerPagos)
router.get('/resumen',    verifyToken, verifyRole('ADMIN'),    obtenerResumenPagos)
router.get('/reporte',    verifyToken, verifyRole('ADMIN'),    reportePagosPDF)
router.get('/mis-pagos',  verifyToken, verifyRole('PACIENTE'), obtenerMisPagos)

module.exports = router