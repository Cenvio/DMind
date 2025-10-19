import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAuth, getGitHubUser, findOrCreateUser } from '../Service/authService';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request: FastifyRequest<{ Querystring: { code?: string } }>, reply: FastifyReply) => {

    console.log("Received auth request with query:", request.query);
    const { code } = request.query;
    if (!code) {
      return reply.status(400).send({ error: "Missing code parameter" });
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
      
      return reply.status(200).send({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          githubUsername: user.github_username,
          avatarUrl: user.avatar_url,
        },
        accessToken,
        refreshToken,
      })
    } catch (error) {
      console.error("Authentication error:", error)
      return reply.status(500).send({
        error: "Authentication failed",
        message: error instanceof Error ? error.message : "Unknown error"
      })
    }
  })

  fastify.post('/refresh', async (request: FastifyRequest<{ Body: { refreshToken?: string } }>, reply: FastifyReply) => {
    const { refreshToken } = request.body;

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

      return reply.status(200).send({
        success: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      })
    } catch (error) {
      console.error("Token refresh error:", error);
      return reply.status(500).send({
        error: "Token refresh failed",
        message: error instanceof Error ? error.message : "Unknown error"
      })
    }
  })
}
