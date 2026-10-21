import { CalcularImcRequestDto } from '../../../application/ports/in/CalcularImcUseCase.js';

/** Valida el contrato de transporte. Los rangos pertenecen al dominio. */
export function decodeImcRequest(json: string): CalcularImcRequestDto {
  const value: unknown = JSON.parse(json);
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('La solicitud debe ser un objeto JSON.');
  }
  const dto = value as Record<string, unknown>;
  if ((dto.id !== undefined && (typeof dto.id !== 'string' || !dto.id.trim())) ||
      typeof dto.peso !== 'number' || typeof dto.altura !== 'number') {
    throw new Error('Se requieren peso y altura numéricos y un id de texto opcional.');
  }
  return { id: dto.id as string | undefined, peso: dto.peso, altura: dto.altura };
}
