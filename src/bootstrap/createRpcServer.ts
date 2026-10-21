import { ImcCalculatorService } from '../domain/service/ImcCalculatorService.js';
import { CalcularImcUseCaseImpl } from '../application/usecases/CalcularImcUseCaseImpl.js';
import { LoggerPort } from '../application/ports/out/LoggerPort.js';
import { ConsoleLoggerAdapter } from '../infrastructure/adapters/logger/ConsoleLoggerAdapter.js';
import { RpcServerAdapter, RpcServerConfig } from '../infrastructure/adapters/rpc/RpcServerAdapter.js';

export function createRpcServer(config: RpcServerConfig, logger: LoggerPort = new ConsoleLoggerAdapter()) {
  const useCase = new CalcularImcUseCaseImpl(new ImcCalculatorService(), logger);
  return { server: new RpcServerAdapter(useCase, logger, config), useCase, logger };
}
