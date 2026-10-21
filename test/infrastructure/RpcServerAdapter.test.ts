import { describe, it, expect } from 'vitest';
import { createRpcServer } from '../../src/bootstrap/createRpcServer.js';

describe('Servidor RPC por HTTP', () => {
  it('invoca el dominio y valida rutas, métodos y parámetros', async () => {
    const { server } = createRpcServer({ host: '127.0.0.1', port: 0 }, { info() {}, warn() {}, error() {} });
    await server.start();
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Sin puerto');
    const url = `http://127.0.0.1:${address.port}/rpc`;
    const invoke = async (body: unknown) => {
      const response = await fetch(url, { method: 'POST', body: JSON.stringify(body) });
      return { status: response.status, data: await response.json() };
    };
    try {
      const success = await invoke({ id: '1', method: 'calcularImc', params: { peso: 70, altura: 175 } });
      expect(success.status).toBe(200);
      expect(success.data.result.data.imc).toBe(22.86);
      const invalid = await invoke({ id: '2', method: 'calcularImc', params: { peso: 501, altura: 175 } });
      expect(invalid.data.result.error.codigo).toBe('DATOS_INVALIDOS');
      expect((await invoke({ id: '3', method: 'otro' })).data.error.codigo).toBe('METODO_NO_ENCONTRADO');
      expect((await invoke({ id: '4', method: 'calcularImc', params: { peso: '70' } })).status).toBe(400);
      expect((await invoke(null)).status).toBe(400);
      expect((await fetch(url)).status).toBe(404);
      const malformed = await fetch(url, { method: 'POST', body: '{' });
      expect(malformed.status).toBe(400);
      const tooLarge = await fetch(url, { method: 'POST', body: 'x'.repeat(9000) });
      expect(tooLarge.status).toBe(413);
    } finally { await server.stop(); }
    await server.stop();
  });
});
