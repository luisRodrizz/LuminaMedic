const Redis = require('ioredis')

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: {},
      retryStrategy: (times) => Math.min(times * 500, 30000),
    })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => Math.min(times * 500, 30000),
      maxRetriesPerRequest: null,
    })

redis.on('connect', () => {
  const logger = require('./logger')
  logger.info('Redis conectado correctamente')
})

redis.on('ready', () => {
  const logger = require('./logger')
  logger.info('Redis listo para usarse')
})

redis.on('error', (err) => {
  const logger = require('./logger')
  logger.error(`Redis error: ${err?.message || err}`)
  console.error('Redis full error:', err)
})

module.exports = redis