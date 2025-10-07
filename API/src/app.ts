import Fastify from 'fastify'

export function buildApp() {
  const fastify = Fastify({
    logger: true
  });

  return fastify;
}