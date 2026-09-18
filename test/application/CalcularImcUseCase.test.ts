import { describe, it, expect, vi } from 'vitest';
import { CalcularImcUseCaseImpl } from '../../src/application/usecases/CalcularImcUseCaseImpl.js';
import { ImcCalculatorService } from '../../src/domain/service/ImcCalculatorService.js';
import { LoggerPort } from '../../src/application/ports/out/LoggerPort.js';

describe('CalcularImcUseCaseImpl (Application)', () => {
  const dummyLogger: LoggerPort = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };

  const imcService = new ImcCalculatorService();
  const useCase = new CalcularImcUseCaseImpl(imcService, dummyLogger);

  it('debe procesar exitosamente un DTO válido con status SUCCESS', async () => {
    const response = await useCase.ejecutar({
      id: 'req-12345',
      peso: 80,
      altura: 1.80
    });

    expect(response.status).toBe('SUCCESS');
    expect(response.id).toBe('req-12345');
    expect(response.data).toBeDefined();
    expect(response.data?.imc).toBe(24.69);
    expect(response.data?.clasificacion).toBe('Normal (Peso saludable)');
    expect(response.error).toBeUndefined();
    expect(response.timestamp).toBeDefined();
  });

  it('debe devolver un DTO con status ERROR y mensaje claro cuando los datos son inválidos', async () => {
    const response = await useCase.ejecutar({
      id: 'req-invalid',
      peso: -5,
      altura: 1.70
    });

    expect(response.status).toBe('ERROR');
    expect(response.id).toBe('req-invalid');
    expect(response.data).toBeUndefined();
    expect(response.error?.codigo).toBe('DATOS_INVALIDOS');
    expect(response.error?.mensaje).toContain('El peso debe ser mayor a 0');
  });
});
