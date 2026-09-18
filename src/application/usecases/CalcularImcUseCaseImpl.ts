import {
  CalcularImcUseCase,
  CalcularImcRequestDto,
  CalcularImcResponseDto
} from '../ports/in/CalcularImcUseCase.js';
import { LoggerPort } from '../ports/out/LoggerPort.js';
import { ImcCalculatorService } from '../../domain/service/ImcCalculatorService.js';
import { Paciente } from '../../domain/model/Paciente.js';

/**
 * Implementación del caso de uso CalcularImcUseCase.
 * Orquesta las entidades y servicios del dominio y registra eventos a través del LoggerPort.
 */
export class CalcularImcUseCaseImpl implements CalcularImcUseCase {
  constructor(
    private readonly imcService: ImcCalculatorService,
    private readonly logger: LoggerPort
  ) {}

  async ejecutar(dto: CalcularImcRequestDto): Promise<CalcularImcResponseDto> {
    const timestamp = new Date().toISOString();

    try {
      this.logger.info(`Procesando solicitud de cálculo de IMC [ID: ${dto.id || 'N/A'}]`, {
        peso: dto.peso,
        altura: dto.altura
      });

      const paciente = new Paciente(dto.peso, dto.altura);
      const resultado = this.imcService.calcular(paciente);

      this.logger.info(`Cálculo exitoso [ID: ${dto.id || 'N/A'}]`, {
        imc: resultado.imc,
        clasificacion: resultado.clasificacion
      });

      return {
        id: dto.id,
        status: 'SUCCESS',
        data: {
          imc: resultado.imc,
          clasificacion: resultado.clasificacion,
          interpretacion: resultado.interpretacion
        },
        timestamp
      };
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : 'Error inesperado al calcular el IMC.';

      this.logger.error(`Error en validación o cálculo [ID: ${dto.id || 'N/A'}]: ${mensaje}`, err);

      return {
        id: dto.id,
        status: 'ERROR',
        error: {
          codigo: 'DATOS_INVALIDOS',
          mensaje
        },
        timestamp
      };
    }
  }
}
