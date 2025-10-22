import { FastifyRequest, FastifyReply } from 'fastify'
import { verifyAccessToken, JWTPayload } from '../utils/jwt'

declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload
    cookies: {
      accessToken?: string
      refreshToken?: string
      [key: string]: string | undefined
    }
  }
}

export const authenticateToken = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization
    const cookieToken = request.cookies?.accessToken

    let token: string | undefined

    if (authHeader) {
      token = authHeader.startsWith('Bearer') ? authHeader.substring(7) : authHeader
    } else if (cookieToken) {
      token = cookieToken
    }

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