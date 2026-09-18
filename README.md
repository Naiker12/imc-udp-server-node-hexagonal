# Servidor UDP para Cálculo de IMC (Arquitectura Hexagonal)

Servidor de cálculo de Índice de Masa Corporal (IMC) desarrollado en **Node.js** y **TypeScript**, comunicándose mediante sockets de datagramas **UDP/IP** (`node:dgram`) y estructurado estrictamente bajo los principios de **Arquitectura Hexagonal (Puertos y Adaptadores)**.

---

## 🏛️ Arquitectura del Proyecto

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

## 📡 Protocolo de Comunicación UDP/IP

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

## 🚀 Instalación y Ejecución

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
