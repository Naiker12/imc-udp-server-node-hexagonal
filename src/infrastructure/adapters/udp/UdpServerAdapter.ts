import dgram, { Socket, RemoteInfo } from 'node:dgram';
import { CalcularImcUseCase } from '../../../application/ports/in/CalcularImcUseCase.js';
import { LoggerPort } from '../../../application/ports/out/LoggerPort.js';

export interface UdpServerConfig {
  port: number;
  host: string;
}

/**
 * Adaptador primario (Driving Adapter) para el protocolo UDP/IP.
 * Es el único punto de la aplicación del servidor que interactúa con sockets dgram.
 * Recibe datagramas, valida el formato JSON, invoca el caso de uso y responde al remitente.
 */
export class UdpServerAdapter {
  private socket: Socket | null = null;

  constructor(
    private readonly calcularImcUseCase: CalcularImcUseCase,
    private readonly logger: LoggerPort,
    private readonly config: UdpServerConfig = { port: 9050, host: '0.0.0.0' }
  ) {}

  /**
   * Inicia el socket UDP y comienza a escuchar peticiones.
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = dgram.createSocket('udp4');

        this.socket.on('error', (err) => {
          this.logger.error(`Error en el socket UDP del servidor: ${err.message}`, err);
        });

        this.socket.on('message', (msg: Buffer, rinfo: RemoteInfo) => {
          this.handleIncomingMessage(msg, rinfo);
        });

        this.socket.on('listening', () => {
          const address = this.socket?.address();
          this.logger.info(`🚀 Servidor UDP Hexagonal de IMC escuchando en ${address?.address}:${address?.port}`);
          resolve();
        });

        this.socket.bind(this.config.port, this.config.host);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Procesa un datagrama UDP entrante de forma asíncrona.
   */
  private async handleIncomingMessage(msg: Buffer, rinfo: RemoteInfo): Promise<void> {
    const rawContent = msg.toString('utf-8');
    this.logger.info(`Datagrama recibido de [${rinfo.address}:${rinfo.port}] (${msg.length} bytes)`);

    let parsedPayload: any;
    let requestId: string | undefined;

    try {
      parsedPayload = JSON.parse(rawContent);
      requestId = parsedPayload?.id;
    } catch {
      this.logger.warn(`Mensaje no es JSON válido de [${rinfo.address}:${rinfo.port}]: "${rawContent}"`);
      const errorResponse = {
        id: undefined,
        status: 'ERROR',
        error: {
          codigo: 'FORMATO_INVALIDO',
          mensaje: 'El paquete UDP debe contener una estructura JSON válida.'
        },
        timestamp: new Date().toISOString()
      };
      this.sendResponse(errorResponse, rinfo);
      return;
    }

    // Ejecutamos el caso de uso mediante el puerto de entrada
    const resultado = await this.calcularImcUseCase.ejecutar({
      id: requestId,
      peso: parsedPayload.peso,
      altura: parsedPayload.altura
    });

    // Enviamos el datagrama de respuesta al cliente emisor
    this.sendResponse(resultado, rinfo);
  }

  /**
   * Serializa y despacha un datagrama UDP de respuesta al cliente.
   */
  private sendResponse(responsePayload: object, rinfo: RemoteInfo): void {
    if (!this.socket) {
      this.logger.error('No se puede enviar respuesta: socket no inicializado.');
      return;
    }

    const payloadBuffer = Buffer.from(JSON.stringify(responsePayload), 'utf-8');

    this.socket.send(payloadBuffer, 0, payloadBuffer.length, rinfo.port, rinfo.address, (err) => {
      if (err) {
        this.logger.error(`Error enviando datagrama a [${rinfo.address}:${rinfo.port}]: ${err.message}`, err);
      } else {
        this.logger.info(`Respuesta enviada exitosamente a [${rinfo.address}:${rinfo.port}] (${payloadBuffer.length} bytes)`);
      }
    });
  }

  /**
   * Cierra el socket UDP de forma controlada.
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.socket) {
        this.socket.close(() => {
          this.logger.info('Servidor UDP detenido correctamente.');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
