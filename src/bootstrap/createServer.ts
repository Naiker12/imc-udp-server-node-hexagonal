import { ImcCalculatorService } from '../domain/service/ImcCalculatorService.js';
import { CalcularImcUseCaseImpl } from '../application/usecases/CalcularImcUseCaseImpl.js';
import { LoggerPort } from '../application/ports/out/LoggerPort.js';
import { ConsoleLoggerAdapter } from '../infrastructure/adapters/logger/ConsoleLoggerAdapter.js';
import { UdpServerAdapter, UdpServerConfig } from '../infrastructure/adapters/udp/UdpServerAdapter.js';

/** Composition root: aquí se eligen las implementaciones concretas. */
export function createServer(config: UdpServerConfig, logger: LoggerPort = new ConsoleLoggerAdapter()) {
  const service = new ImcCalculatorService();
  const useCase = new CalcularImcUseCaseImpl(service, logger);
  const server = new UdpServerAdapter(useCase, logger, config);
  return { server, useCase, logger };
}
