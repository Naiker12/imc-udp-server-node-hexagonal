/**
 * Puerto de salida (Driven Port) para el registro de eventos y logs.
 * Permite que la capa de aplicación registre información sin acoplarse a una librería o salida específica.
 */
export interface LoggerPort {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: unknown): void;
}
