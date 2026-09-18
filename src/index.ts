import { ImcCalculatorService } from './domain/service/ImcCalculatorService.js';
import { CalcularImcUseCaseImpl } from './application/usecases/CalcularImcUseCaseImpl.js';
import { ConsoleLoggerAdapter } from './infrastructure/adapters/logger/ConsoleLoggerAdapter.js';
import { UdpServerAdapter } from './infrastructure/adapters/udp/UdpServerAdapter.js';

const PORT = Number(process.env.UDP_PORT) || 9050;
const HOST = process.env.UDP_HOST || '0.0.0.0';

const logger = new ConsoleLoggerAdapter();
const imcService = new ImcCalculatorService();
const calcularImcUseCase = new CalcularImcUseCaseImpl(imcService, logger);

const serverAdapter = new UdpServerAdapter(calcularImcUseCase, logger, {
  port: PORT,
  host: HOST
});

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
