import { describe, it, expect } from 'vitest';
import dgram from 'node:dgram';
import { createServer } from '../../src/bootstrap/createServer.js';

describe('Servidor UDP real', () => {
  it('rechaza formatos inválidos y sigue atendiendo cálculos', async () => {
    const probe = dgram.createSocket('udp4');
    await new Promise<void>(resolve => probe.bind(0, '127.0.0.1', resolve));
    const port = probe.address().port;
    await new Promise<void>(resolve => probe.close(resolve));
    const { server } = createServer({ host: '127.0.0.1', port }, {
      info() {}, warn() {}, error() {}
    });
    const client = dgram.createSocket('udp4');
    const request = (payload: string) => new Promise<any>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Sin respuesta UDP')), 1500);
      client.once('message', msg => { clearTimeout(timer); resolve(JSON.parse(msg.toString())); });
      client.send(payload, port, '127.0.0.1');
    });
    try {
      await server.start();
      for (const payload of ['null', '[]', '{', '{"peso":"70","altura":1.75}']) {
        expect((await request(payload)).error.codigo).toBe('FORMATO_INVALIDO');
      }
      const response = await request(JSON.stringify({ id: 'real', peso: 70, altura: 175 }));
      expect(response.id).toBe('real');
      expect(response.data.imc).toBe(22.86);
    } finally {
      client.close();
      await server.stop();
      await server.stop();
    }
  });
});
