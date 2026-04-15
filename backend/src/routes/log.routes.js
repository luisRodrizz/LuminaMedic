const express = require('express')
const router = express.Router()
const { obtenerLogs } = require('../controllers/log.controller')
const { verifyToken, verifyRole } = require('../middlewares/auth.middleware')

router.get('/', verifyToken, verifyRole('ADMIN'), obtenerLogs)

module.exports = router