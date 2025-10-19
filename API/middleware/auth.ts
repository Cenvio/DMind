import { FastifyRequest, FastifyReply } from 'fastify'
import { verifyAccessToken, JWTPayload } from '../utils/jwt'

declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload
  }
}

export const authenticateToken = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader) {
      return reply.status(401).send({ error: 'No authorization header provided' })
    }

    const token = authHeader.startsWith('Bearer') ? authHeader.substring(7) : authHeader

    if (!token) {
      return reply.status(401).send({ error: 'No token provided' })
    }

    const payload = verifyAccessToken(token)

    if (!payload) {
      return reply.status(401).send({ error: 'Invalid or expired token' })
    }

    request.user = payload
  } catch (error) {
    console.error('Authentication error:', error)
    return reply.status(401).send({ error: 'Authentication failed' })
  }
}