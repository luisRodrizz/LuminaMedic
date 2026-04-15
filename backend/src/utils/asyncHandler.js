/**
 * asyncHandler — envuelve controllers async para capturar errores
 * y pasarlos automáticamente al errorHandler global (error.middleware.js)
 *
 * Uso en rutas:
 *   router.get('/', asyncHandler(obtenerCosas))
 *
 * Esto elimina la necesidad de try/catch en cada controller.
 * Los errores no manejados van al errorHandler que:
 *   - Loguea con Winston
 *   - Maneja errores de Prisma (P2002, P2025)
 *   - En producción devuelve mensaje genérico sin exponer detalles
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = asyncHandler