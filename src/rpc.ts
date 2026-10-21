import { createRpcServer } from './bootstrap/createRpcServer.js';

const host = process.env.RPC_HOST || '127.0.0.1';
const port = Number(process.env.RPC_PORT || 9060);
const { server, logger } = createRpcServer({ host, port });

async function main() {
  await server.start();
  logger.info(`Servidor RPC de IMC disponible en http://${host}:${port}/rpc`);
  const shutdown = () => {
    void server.stop().catch(error => { logger.error('Error al cerrar RPC.', error); process.exitCode = 1; });
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}
main().catch((error: unknown) => { logger.error('No se pudo iniciar RPC.', error); process.exitCode = 1; });
