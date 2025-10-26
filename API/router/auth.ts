import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { getAuth, getGitHubUser, findOrCreateUser } from '../Service/authService'
import { generateTokens, verifyRefreshToken, verifyAccessToken } from '../utils/jwt'
import { PrismaClient } from '@prisma/client'

const isProduction = process.env.NODE_ENV === 'production'
const prisma = new PrismaClient()

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.get('/github/callback', async (request: FastifyRequest<{ Querystring: { code?: string } }>, reply: FastifyReply) => {
    const { code } = request.query
    if (!code) {
      return reply.status(400).send({ error: "Missing code parameter" })
    }

    try {
      const githubAccessToken = await getAuth(code)
      const githubUser = await getGitHubUser(githubAccessToken)

      const user = await findOrCreateUser(githubUser, githubAccessToken)

      const { accessToken, refreshToken } = generateTokens({
        userId: user.id,
        email: user.email,
        githubUsername: user.github_username,
      })

      reply.setCookie('accessToken', accessToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
          maxAge: 15 * 60,
          path: '/',
        }).setCookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        })

      return reply.redirect(`${process.env.FRONTEND_URL}/auth/callback`)
    } catch (error) {
      console.error("Authentication error:", error)
      return reply.status(500).send({
        error: "Authentication failed",
        message: error instanceof Error ? error.message : "Unknown error"
      })
    }
  })

  fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies.refreshToken;

    if (!refreshToken) {
      return reply.status(400).send({ error: "Missing refresh token" })
    }

    try {
      const payload = verifyRefreshToken(refreshToken)

      if (!payload) {
        return reply.status(401).send({ error: "Invalid or expired refresh token" })
      }

      const tokens = generateTokens({
        userId: payload.userId,
        email: payload.email,
        githubUsername: payload.githubUsername,
      })

      reply
        .setCookie('accessToken', tokens.accessToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
          maxAge: 15 * 60,
          path: '/',
        })
        .setCookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        })

      return reply.status(200).send({success: true})
    } catch (error) {
      console.error("Token refresh error:", error)
      return reply.status(500).send({
        error: "Token refresh failed",
        message: error instanceof Error ? error.message : "Unknown error"
      })
    }
  })

  fastify.post('/logout', async (_request: FastifyRequest, reply: FastifyReply) => {
    reply
      .clearCookie('accessToken', { path: '/' })
      .clearCookie('refreshToken', { path: '/' })

    return reply.status(200).send({
      success: true,
      message: 'Logged out successfully'
    })
  })

  fastify.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    const accessToken = request.cookies.accessToken;
    if (!accessToken) {
      return reply.status(401).send({ error: 'No access token provided' })
    }

    try {
      const payload = verifyAccessToken(accessToken)

      if (!payload) {
        return reply.status(401).send({ error: 'Invalid token' })
      }

      const user = await prisma.users.findUnique({
        where: { id: payload.userId }
      })

      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }

      return reply.status(200).send({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          githubUsername: user.github_username,
          avatarUrl: user.avatar_url,
        }
      })
    } catch (error) {
      console.error('Get user error:', error)
      return reply.status(500).send({ error: 'Failed to get user' })
    }
  })
}
