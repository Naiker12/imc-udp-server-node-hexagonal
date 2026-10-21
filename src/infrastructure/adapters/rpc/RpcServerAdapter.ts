import http from 'node:http';
import { CalcularImcUseCase } from '../../../application/ports/in/CalcularImcUseCase.js';
import { LoggerPort } from '../../../application/ports/out/LoggerPort.js';

export interface RpcServerConfig { host: string; port: number }

/** RPC sobre HTTP. El transporte solo conoce el puerto de entrada. */
export class RpcServerAdapter {
  private readonly server: http.Server;

  constructor(useCase: CalcularImcUseCase, logger: LoggerPort, private readonly config: RpcServerConfig) {
    this.server = http.createServer(async (request, response) => {
      const send = (status: number, body: object) => {
        response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify(body));
      };
      if (request.url !== '/rpc' || request.method !== 'POST') {
        request.resume();
        send(404, { error: { codigo: 'RUTA_INVALIDA', mensaje: 'Utilice POST /rpc.' } });
        return;
      }
      let id: string | undefined;
      try {
        let body = '';
        let bytes = 0;
        for await (const chunk of request) {
          bytes += chunk.length;
          if (bytes > 8192) {
            send(413, { error: { codigo: 'SOLICITUD_GRANDE', mensaje: 'Máximo 8192 bytes.' } });
            return;
          }
          body += chunk.toString('utf8');
        }
        let value: unknown;
        try { value = JSON.parse(body); }
        catch { send(400, { error: { codigo: 'FORMATO_INVALIDO', mensaje: 'JSON inválido.' } }); return; }
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
          send(400, { error: { codigo: 'FORMATO_INVALIDO', mensaje: 'Se requiere un objeto.' } }); return;
        }
        const dto = value as Record<string, unknown>;
        if (typeof dto.id !== 'string' || !dto.id.trim()) {
          send(400, { error: { codigo: 'FORMATO_INVALIDO', mensaje: 'Se requiere id de texto.' } }); return;
        }
        id = dto.id;
        if (dto.method !== 'calcularImc') {
          send(400, { id, error: { codigo: 'METODO_NO_ENCONTRADO', mensaje: 'Método remoto desconocido.' } }); return;
        }
        if (!dto.params || typeof dto.params !== 'object' || Array.isArray(dto.params)) {
          send(400, { id, error: { codigo: 'PARAMETROS_INVALIDOS', mensaje: 'Se requieren peso y altura.' } }); return;
        }
        const params = dto.params as Record<string, unknown>;
        if (typeof params.peso !== 'number' || typeof params.altura !== 'number') {
          send(400, { id, error: { codigo: 'PARAMETROS_INVALIDOS', mensaje: 'Peso y altura deben ser numéricos.' } }); return;
        }
        const result = await useCase.ejecutar({ id, peso: params.peso, altura: params.altura });
        send(200, { id, result });
      } catch (error) {
        logger.error('Error procesando invocación RPC.', error);
        if (!response.headersSent) send(500, { id, error: { codigo: 'ERROR_INTERNO', mensaje: 'No se pudo ejecutar el método.' } });
      }
    });
    this.server.requestTimeout = 10000;
    this.server.on('error', error => logger.error('Error en servidor RPC.', error));
  }

  async start(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const onError = (error: Error) => reject(error);
      this.server.once('error', onError);
      this.server.listen(this.config.port, this.config.host, () => {
        this.server.removeListener('error', onError);
        resolve();
      });
    });
  }

  address() { return this.server.address(); }

  async stop(): Promise<void> {
    if (!this.server.listening) return;
    await new Promise<void>((resolve, reject) => this.server.close(error => error ? reject(error) : resolve()));
  }
}
