import { createServer } from './bootstrap/createServer.js';

const PORT = Number(process.env.UDP_PORT) || 9050;
const HOST = process.env.UDP_HOST || '0.0.0.0';

const { server: serverAdapter, logger } = createServer({ port: PORT, host: HOST });

async function bootstrap() {
  try {
    await serverAdapter.start();

    const handleShutdown = async (signal: string) => {
      logger.warn(`Señal ${signal} recibida. Cerrando servidor UDP...`);
      await serverAdapter.stop();
      process.exit(0);
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (error) {
    logger.error('Fallo fatal al inicializar el servidor UDP:', error);
    process.exit(1);
  }
}

bootstrap();
