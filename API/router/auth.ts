import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAuth } from '../Service/authService';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request: FastifyRequest<{ Querystring: { code?: string } }>, reply: FastifyReply) => {
  const { code } = request.query;
  if (!code) {
    return reply.status(400).send({ error: "Missing code parameter" });
  }

    const token = await getAuth(code)
    console.log(token)
    return 
  });
}