import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import authRoutes from '../router/auth';
import 'dotenv/config';

export function buildApp() {
  const fastify = Fastify({
    logger: true
  })

  fastify.register(cors, {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  fastify.register(rateLimit, {
    max: 100, 
    timeWindow: '15 minutes',
    cache: 10000,
    allowList: [],
    redis: undefined,
  })

  fastify.register(async (instance) => {
    instance.register(rateLimit, {
      max: 10,
      timeWindow: '15 minutes',
    })

    instance.register(authRoutes, { prefix: 'auth/github/callback' })
  })

  return fastify
}