const { Redis } = require('ioredis')

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      retryStrategy: (times) => Math.min(times * 500, 30000),
      maxRetriesPerRequest: 3,
    })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => Math.min(times * 500, 30000),
      maxRetriesPerRequest: 3,
    })

redis.on('connect', () => {
  const logger = require('./logger')
  logger.info('Redis conectado correctamente')
})

redis.on('error', (err) => {
  const logger = require('./logger')
  logger.error(`Redis error: ${err.message}`)
})

module.exports = redis