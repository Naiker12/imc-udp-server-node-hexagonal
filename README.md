# Servidor UDP para Cálculo de IMC (Arquitectura Hexagonal)

Servidor de cálculo de Índice de Masa Corporal (IMC) desarrollado en **Node.js** y **TypeScript**, comunicándose mediante sockets de datagramas **UDP/IP** (`node:dgram`) y estructurado estrictamente bajo los principios de **Arquitectura Hexagonal (Puertos y Adaptadores)**.

---

## Arquitectura del Proyecto

El servidor desacopla totalmente las reglas de negocio y los casos de uso de cualquier tecnología de transporte o infraestructura:

```
imc-udp-server-node-hexagonal/
├── src/
│   ├── domain/                         # Lógica pura del IMC (sin librerías ni red)
│   │   ├── model/
│   │   │   ├── Paciente.ts             # Entidad Paciente con validaciones de rangos
│   │   │   └── ResultadoImc.ts         # Value Object con valor IMC y categoría OMS
│   │   └── service/
│   │       └── ImcCalculatorService.ts # Cálculo matemático y clasificación OMS
│   ├── application/                    # Orquestación de casos de uso y puertos
│   │   ├── ports/
│   │   │   ├── in/
│   │   │   │   └── CalcularImcUseCase.ts # Driving Port (Puerto de entrada)
│   │   │   └── out/
│   │   │       └── LoggerPort.ts         # Driven Port (Puerto de salida)
│   │   └── usecases/
│   │       └── CalcularImcUseCaseImpl.ts # Implementación del caso de uso
│   ├── infrastructure/                 # Adaptadores tecnológicos externos
│   │   └── adapters/
│   │       ├── udp/
│   │       │   └── UdpServerAdapter.ts # Adaptador UDP (node:dgram, manejo de sockets)
│   │       └── logger/
│   │           └── ConsoleLoggerAdapter.ts # Adaptador de consola estructurada
│   └── index.ts                        # Composition Root / Bootstrap
├── test/
│   ├── domain/                         # Pruebas unitarias de dominio
│   └── application/                    # Pruebas unitarias de casos de uso
├── package.json
├── tsconfig.json
└── README.md
```

---

## Protocolo de Comunicación UDP/IP

Los mensajes viajan sobre datagramas UDP codificados en cadenas JSON (UTF-8).

### 1. Petición recibida (Request)
```json
{
  "id": "req-1711000000000",
  "peso": 75.5,
  "altura": 1.78
}
```

### 2. Respuesta Exitosa (Success)
```json
{
  "id": "req-1711000000000",
  "status": "SUCCESS",
  "data": {
    "imc": 23.83,
    "clasificacion": "Normal (Peso saludable)",
    "interpretacion": "Su peso se encuentra dentro del rango óptimo y saludable según la OMS."
  },
  "timestamp": "2026-09-18T20:45:00.000Z"
}
```

### 3. Respuesta de Error (Error)
```json
{
  "id": "req-1711000000000",
  "status": "ERROR",
  "error": {
    "codigo": "DATOS_INVALIDOS",
    "mensaje": "El peso debe ser mayor a 0 kg y menor o igual a 500 kg."
  },
  "timestamp": "2026-09-18T20:45:00.000Z"
}
```

---

## Instalación y Ejecución

### Prerrequisitos
- Node.js >= 20
- Gestor de paquetes `pnpm` o `npm`

### Pasos

1. Instalar dependencias:
   ```bash
   pnpm install
   # o bien: npm install
   ```

2. Ejecutar en modo desarrollo:
   ```bash
   pnpm dev
   # o bien: npm run dev
   ```

3. Variables de entorno opcionales:
   - `UDP_PORT`: Puerto de escucha UDP (por defecto: `9050`).
   - `UDP_HOST`: Host de enlace (por defecto: `0.0.0.0`).

   *Ejemplo en Windows PowerShell:*
   ```powershell
   $env:UDP_PORT=9050; pnpm dev
   ```

4. Compilar y ejecutar en producción:
   ```bash
   pnpm build
   pnpm start
   ```

5. Ejecutar la suite de pruebas unitarias:
   ```bash
   pnpm test
   ```


## Invocación remota con Node.js (RPC)

No requiere Java ni dependencias de producción adicionales. Utiliza Node.js 20 o superior y TypeScript. Es un protocolo RPC propio sobre HTTP, no JSON-RPC 2.0 ni Java RMI.

1. En la terminal del servidor: `npm run dev:rpc`.
2. En la terminal del cliente: `npm run dev:rpc`.
3. Introducir peso y altura; el cliente invoca el método remoto `calcularImc`.

Para ejecutar compilado, usar `npm run build` en ambos proyectos y después `npm run start:rpc` en cada uno. El comando `npm run dev` continúa ejecutando UDP.

Configuración RPC:

| Variable | Proyecto | Valor predeterminado |
|---|---|---|
| RPC_HOST | Servidor | 127.0.0.1 |
| RPC_PORT | Ambos | 9060 |
| SERVER_HOST | Cliente | 127.0.0.1 |
| TIMEOUT_MS | Cliente | 4000 |

Para equipos distintos, configurar RPC_HOST=0.0.0.0 en el servidor y SERVER_HOST con la IP del servidor en el cliente.

Contrato: `POST /rpc`, cuerpo JSON:

`{ "id": "ejemplo-1", "method": "calcularImc", "params": { "peso": 70, "altura": 175 } }`

La respuesta incluye `id` y `result`. El resultado conserva el contrato del caso de uso: status, data o error y timestamp. Un fallo de protocolo devuelve un estado HTTP de error y el campo error; los errores de negocio se devuelven dentro de result con status ERROR.

Pruebas unitarias y de transporte: `npm test`. Para verificar ambos proyectos juntos, compilar ambos y ejecutar `npm run test:rpc:e2e` desde el cliente. La prueba presupone que las carpetas del cliente y servidor están una al lado de la otra con sus nombres actuales.
