const express = require('express')
const router = express.Router()
const { register, login, solicitarRecuperacion, resetearPassword, cambiarPassword, consultarDniPublico } = require('../controllers/auth.controller')
const validate = require('../middlewares/validate.middleware')
const { registerSchema, loginSchema } = require('../validations/auth.validation')
const { loginLimiter, forgotLimiter, dniLimiter, registerLimiter } = require('../middlewares/rateLimit.middleware')
const { verifyToken } = require('../middlewares/auth.middleware')

router.post('/forgot-password',   forgotLimiter, solicitarRecuperacion)
router.post('/register', registerLimiter, validate(registerSchema), register)
router.post('/login',             loginLimiter, validate(loginSchema), login)
router.post('/reset-password',    forgotLimiter, resetearPassword)
router.patch('/cambiar-password', verifyToken, cambiarPassword)

// Endpoint público para consultar DNI en el registro — sin token
router.get('/consultar-dni/:dni', dniLimiter, consultarDniPublico)

module.exports = router