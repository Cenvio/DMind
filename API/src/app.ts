import Fastify from 'fastify'
import authRoutes from '../router/auth';

export function buildApp() {
  const fastify = Fastify({
    logger: true
  });

  fastify.register(authRoutes, { prefix: '/auth/github/callback' });
  return fastify;
}