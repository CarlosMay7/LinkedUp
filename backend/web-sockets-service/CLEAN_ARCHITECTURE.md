# Web Sockets Service - Clean Architecture

Este servicio implementa la mensajería en tiempo real para LinkedUp utilizando WebSockets (Socket.IO) y siguiendo los principios de Clean Architecture y Clean Code.

## Arquitectura

El servicio está organizado en tres capas principales:

### 1. Domain Layer (Dominio)
Contiene las entidades de negocio y las interfaces que definen los contratos.

**Entidades:**
- `MessageEntity`: Representa un mensaje con validación de negocio
- `UserSessionEntity`: Representa una sesión de usuario conectado
- `RoomSessionEntity`: Representa la participación de un usuario en una sala

**Interfaces:**
- `IMessageBroker`: Contrato para enviar mensajes a través de WebSockets
- `ISessionManager`: Contrato para gestionar sesiones de usuarios
- `IMessageRepository`: Contrato para persistir mensajes y validar recursos (rooms/users)

### 2. Application Layer (Aplicación)
Contiene los servicios que orquestan la lógica de negocio.

**Servicios:**
- `MessageService`: Maneja el envío de mensajes (sala y privados), validación y persistencia
- `SessionService`: Gestiona el registro y desregistro de usuarios
- `TypingService`: Maneja los indicadores de escritura
- `MessageStatusService`: Gestiona las confirmaciones de entrega y lectura

### 3. Infrastructure Layer (Infraestructura)
Contiene las implementaciones concretas y adaptadores.

**Adaptadores:**
- `SocketIOMessageBroker`: Implementación de IMessageBroker usando Socket.IO
- `InMemorySessionManager`: Implementación de ISessionManager con Map en memoria
- `ChatServiceMessageRepository`: Implementación de IMessageRepository que se comunica con chat-service vía HTTP

**Gateways:**
- `ChatGateway`: Gateway de WebSocket que delega a los servicios de aplicación

**DTOs:**
- `SendMessageDto`, `JoinRoomDto`, `TypingDto`, etc.

## Estructura de Directorios

```
src/modules/chat/
├── domain/
│   ├── entities/
│   │   ├── message.entity.ts
│   │   ├── user-session.entity.ts
│   │   └── room-session.entity.ts
│   └── interfaces/
│       ├── message-broker.interface.ts
│       ├── session-manager.interface.ts
│       └── message-repository.interface.ts
├── application/
│   └── services/
│       ├── message.service.ts
│       ├── session.service.ts
│       ├── typing.service.ts
│       └── message-status.service.ts
├── infrastructure/
│   ├── adapters/
│   │   ├── socketio-message-broker.adapter.ts
│   │   ├── in-memory-session-manager.adapter.ts
│   │   └── chat-service-message-repository.adapter.ts
│   ├── gateways/
│   │   └── chat.gateway.ts
│   └── dto/
│       └── chat.dto.ts
└── chat.module.ts
```

## Flujo de Datos

### Flujo Completo de Envío de Mensaje

1. **Cliente se conecta** → ChatGateway → SessionService → InMemorySessionManager
2. **Cliente envía mensaje** → ChatGateway → MessageService:
   - Valida sala/usuario → ChatServiceMessageRepository → chat-service (HTTP GET)
   - Persiste mensaje → ChatServiceMessageRepository → chat-service (HTTP POST)
   - Envía en tiempo real → SocketIOMessageBroker → Socket.IO
3. **Cliente escribe** → ChatGateway → TypingService → SocketIOMessageBroker
4. **Confirmaciones** → ChatGateway → MessageStatusService → SocketIOMessageBroker

## Sincronización con Schemas de Chat Service

El servicio está **completamente sincronizado** con los schemas de MongoDB definidos en chat-service:

### MessageEntity ↔ Message Schema
```typescript
// web-sockets-service (Domain Entity)
export class MessageEntity {
  senderId: string;
  content: string;
  roomId?: string;
  receiverId?: string;
  sentAt: Date;        // ✅ Coincide con schema
  _id?: string;        // ✅ MongoDB ObjectId
}

// chat-service (MongoDB Schema)
@Schema({ timestamps: true })
export class Message {
  @Prop() senderId: string;
  @Prop() content: string;
  @Prop() roomId?: string;
  @Prop() receiverId?: string;
  @Prop() sentAt: Date;
  _id: ObjectId;       // Generado por MongoDB
}
```

**Flujo de sincronización**:
1. web-sockets crea `MessageEntity` sin `_id`
2. Se envía a chat-service via HTTP POST
3. MongoDB genera el `_id` automáticamente
4. chat-service retorna el mensaje persistido con `_id`
5. web-sockets actualiza la entidad con el `_id` recibido
6. Envía por WebSocket el mensaje con el `_id` real de MongoDB

## Integración con Chat Service

El servicio ahora se comunica con **chat-service** para:

### Persistencia de Mensajes
```typescript
POST http://chat-service:3000/messages
Body: {
  roomId?: string,
  senderId: string,
  receiverId?: string,
  content: string
}
```

### Validación de Salas
```typescript
GET http://chat-service:3000/rooms/:roomId
// Returns 200 if exists, 404 if not
```

### Validación de Usuarios
```typescript
GET http://chat-service:3000/users/:userId
// Returns 200 if exists, 404 if not
```

**Variables de entorno**:
```bash
CHAT_SERVICE_URL=http://localhost:3000
```

## Eventos WebSocket

### Eventos del Cliente al Servidor

| Evento | Descripción | Payload |
|--------|-------------|---------|
| `register` | Registrar usuario al conectarse | `{ userId: string }` |
| `joinRoom` | Unirse a una sala | `{ roomId: string, userId: string }` |
| `leaveRoom` | Salir de una sala | `{ roomId: string, userId: string }` |
| `sendMessage` | Enviar mensaje (sala o privado) | `{ senderId: string, content: string, roomId?: string, receiverId?: string }` |
| `typing` | Indicador de escritura | `{ userId: string, isTyping: boolean, roomId?: string, receiverId?: string }` |
| `messageDelivered` | Confirmar entrega de mensaje | `{ messageId: string, userId: string }` |
| `messageRead` | Confirmar lectura de mensaje | `{ messageId: string, userId: string }` |
| `getOnlineUsers` | Obtener usuarios online en sala | `{ roomId: string }` |

### Eventos del Servidor al Cliente

| Evento | Descripción | Payload |
|--------|-------------|---------|
| `registered` | Confirmación de registro | `{ userId: string }` |
| `joinedRoom` | Confirmación de unión a sala | `{ roomId: string, userId: string }` |
| `userJoined` | Notificación de nuevo usuario en sala | `{ roomId: string, userId: string, timestamp: Date }` |
| `leftRoom` | Confirmación de salida de sala | `{ roomId: string, userId: string }` |
| `userLeft` | Notificación de usuario que salió | `{ roomId: string, userId: string, timestamp: Date }` |
| `newMessage` | Nuevo mensaje recibido | `{ id: string, senderId: string, content: string, timestamp: Date, roomId?: string, receiverId?: string }` |
| `messageSent` | Confirmación de envío | `{ messageId: string, ... }` |
| `typing` | Alguien está escribiendo | `{ userId: string, roomId?: string, timestamp: Date }` |
| `message:delivered` | Mensaje entregado | `{ messageId: string, deliveredAt: Date }` |
| `message:read` | Mensaje leído | `{ messageId: string, readAt: Date }` |
| `onlineUsers` | Lista de usuarios online | `{ users: string[] }` |

## Dependency Injection

El módulo utiliza inyección de dependencias basada en símbolos:

```typescript
providers: [
  {
    provide: MESSAGE_BROKER,
    useClass: SocketIOMessageBroker,
  },
  {
    provide: SESSION_MANAGER,
    useClass: InMemorySessionManager,
  },
  // ... otros servicios
]
```

Esto permite:
- **Testabilidad**: Fácil mockeo de dependencias
- **Flexibilidad**: Cambiar implementaciones sin modificar servicios
- **Desacoplamiento**: Los servicios dependen de interfaces, no de implementaciones concretas

## Principios Aplicados

### Clean Architecture
- **Separación de capas**: Domain, Application, Infrastructure
- **Dependency Rule**: Las dependencias apuntan hacia el dominio
- **Inversión de dependencias**: Las capas externas implementan interfaces del dominio

### Clean Code
- **Single Responsibility**: Cada clase tiene una única responsabilidad
- **Nombres descriptivos**: Clases y métodos con nombres que revelan intención
- **Métodos pequeños**: Funciones enfocadas en una sola tarea
- **DRY**: No repetir código, usar helpers privados
- **Logging**: Trazabilidad con NestJS Logger

### SOLID
- **S**: Cada servicio tiene una responsabilidad única
- **O**: Abierto para extensión (interfaces), cerrado para modificación
- **L**: Las implementaciones pueden sustituir interfaces sin romper funcionalidad
- **I**: Interfaces pequeñas y específicas
- **D**: Dependencia de abstracciones (símbolos de inyección)

## Testing

Para testing, se pueden crear mocks fácilmente:

```typescript
const mockMessageBroker: IMessageBroker = {
  sendToRoom: jest.fn(),
  sendToUser: jest.fn(),
  broadcastToRoom: jest.fn(),
  notifyUser: jest.fn(),
};

const mockSessionManager: ISessionManager = {
  registerUser: jest.fn(),
  unregisterUser: jest.fn(),
  getUserSocketId: jest.fn(),
  getUserIdBySocketId: jest.fn(),
  isUserOnline: jest.fn(),
};
```

## Mejoras Futuras

1. **Persistencia de mensajes**: Integrar con chat-service para persistir mensajes
2. **Redis para sesiones**: Reemplazar InMemorySessionManager con RedisSessionManager para escalabilidad
3. **Message Queue**: Usar RabbitMQ/Kafka para comunicación entre microservicios
4. **Rate Limiting**: Implementar límites de mensajes por usuario
5. **Autenticación JWT**: Validar tokens en conexión WebSocket
6. **Métricas**: Agregar Prometheus/Grafana para monitoreo

## Uso

```bash
# Instalar dependencias
npm install

# Compilar
npm run build

# Ejecutar en desarrollo
npm run start:dev

# Ejecutar en producción
npm run start:prod

# Lint
npm run lint

# Tests (cuando se implementen)
npm run test
```

## Conexión del Cliente

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

// Registrar usuario
socket.emit('register', { userId: 'user123' });

// Unirse a sala
socket.emit('joinRoom', { roomId: 'room456', userId: 'user123' });

// Enviar mensaje
socket.emit('sendMessage', {
  senderId: 'user123',
  roomId: 'room456',
  content: 'Hola a todos!'
});

// Escuchar mensajes
socket.on('newMessage', (message) => {
  console.log('Nuevo mensaje:', message);
});
```
