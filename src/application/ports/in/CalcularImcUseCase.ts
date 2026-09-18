/**
 * DTO de entrada para la solicitud de cálculo de IMC.
 */
export interface CalcularImcRequestDto {
  id?: string;
  peso: number;
  altura: number;
}

/**
 * DTO de salida con el resultado del cálculo de IMC.
 */
export interface CalcularImcResponseDto {
  id?: string;
  status: 'SUCCESS' | 'ERROR';
  data?: {
    imc: number;
    clasificacion: string;
    interpretacion: string;
  };
  error?: {
    codigo: string;
    mensaje: string;
  };
  timestamp: string;
}

/**
 * Puerto de entrada (Driving Port) para el caso de uso de calcular el IMC.
 */
export interface CalcularImcUseCase {
  ejecutar(dto: CalcularImcRequestDto): Promise<CalcularImcResponseDto>;
}
