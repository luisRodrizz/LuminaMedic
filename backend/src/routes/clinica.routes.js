const express = require('express')
const router = express.Router()
const { crearClinica, obtenerClinica, actualizarClinica } = require('../controllers/clinica.controller')
const { verifyToken, verifyRole } = require('../middlewares/auth.middleware')
const { uploadClinica } = require('../middlewares/upload.middleware')

router.post('/', verifyToken, verifyRole('ADMIN'), crearClinica)
router.get('/', verifyToken, obtenerClinica)
router.put('/:id', verifyToken, verifyRole('ADMIN'), uploadClinica.single('logo'), actualizarClinica)

module.exports = router