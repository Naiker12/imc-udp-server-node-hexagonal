import { LoggerPort } from '../../../application/ports/out/LoggerPort.js';

/**
 * Adaptador secundario (Driven Adapter) para registro de logs en consola con formato y colores ANSI.
 */
export class ConsoleLoggerAdapter implements LoggerPort {
  private formatPrefix(level: string, color: string): string {
    const time = new Date().toLocaleTimeString('es-CO', { hour12: false });
    return `\x1b[90m[${time}]\x1b[0m ${color}[${level}]\x1b[0m`;
  }

  info(message: string, context?: Record<string, unknown>): void {
    const prefix = this.formatPrefix('INFO', '\x1b[32m'); // Verde
    const ctxStr = context ? ` \x1b[90m${JSON.stringify(context)}\x1b[0m` : '';
    console.log(`${prefix} ${message}${ctxStr}`);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    const prefix = this.formatPrefix('WARN', '\x1b[33m'); // Amarillo
    const ctxStr = context ? ` \x1b[90m${JSON.stringify(context)}\x1b[0m` : '';
    console.warn(`${prefix} ${message}${ctxStr}`);
  }

  error(message: string, error?: unknown): void {
    const prefix = this.formatPrefix('ERROR', '\x1b[31m'); // Rojo
    console.error(`${prefix} ${message}`);
    if (error && error instanceof Error && error.stack) {
      console.error(`\x1b[90m${error.stack}\x1b[0m`);
    }
  }
}
