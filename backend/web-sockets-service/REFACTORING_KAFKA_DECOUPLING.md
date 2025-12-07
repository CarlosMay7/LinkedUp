# Refactorización - Desacoplamiento de Kafka

## Cambios Realizados

### 1. Interfaces de Abstracción (Domain Layer)

**Archivos creados:**
- `event-producer.interface.ts` - IEventProducer para publicar eventos
- `event-consumer.interface.ts` - IEventConsumer para consumir eventos
- `event-bus.interface.ts` - IEventBus para patrón genérico

**Beneficios:**
- ✅ Gateway y servicios no dependen de Kafka
- ✅ Fácil cambiar implementación (Kafka → RabbitMQ, Redis, etc)
- ✅ Clean Architecture: inversión de dependencias

### 2. Refactorización de Kafka Producer

**Archivo:** `ws.kafka.producer.ts`

**Cambios:**
- ✅ Implementa IEventProducer
- ✅ Mejor manejo de errores y logging
- ✅ Validación de estado del productor
- ✅ Try-catch en publicación

**Antes:**
```typescript
async publishMessageCreated(payload) {
  await this.producer.send({...});
}
```

**Después:**
```typescript
async publishMessageCreated(payload) {
  if (!this.producer) throw new Error('Producer not initialized');
  try {
    await this.producer.send({...});
    this.logger.debug(`Message published`);
  } catch (error) {
    this.logger.error(`Failed: ${error.message}`);
    throw error;
  }
}
```

### 3. Refactorización de Kafka Consumer

**Archivo:** `ws.kafka.consumer.ts`

**Cambios:**
- ✅ Mejor manejo de errores
- ✅ Logging mejorado (debug en lugar de error)
- ✅ Extracción de lógica a método privado
- ✅ Validación de mensajes

**Antes:**
```typescript
eachMessage: async ({ message }) => {
  try {
    const value = message.value?.toString();
    if (!value) return;
    const payload = JSON.parse(value);
    await this.wsMessageEventService.handleProcessedMessage(payload);
  } catch (err) {
    this.logger.error('Error processing Kafka message', err);
  }
}
```

**Después:**
```typescript
eachMessage: async ({ message }) => {
  await this.processMessage(message);
}

private async processMessage(message: any): Promise<void> {
  try {
    const value = message.value?.toString();
    if (!value) {
      this.logger.warn('Empty message received');
      return;
    }
    const payload = JSON.parse(value);
    await this.wsMessageEventService.onMessageProcessed(payload);
    this.logger.debug(`Message processed: ${payload.id}`);
  } catch (error) {
    this.logger.error(`Error: ${error.message}`, error);
  }
}
```

### 4. Refactorización de WsMessageEventService

**Archivo:** `message-event.service.ts`

**Cambios:**
- ✅ Implementa IEventConsumer
- ✅ Método renombrado: `handleProcessedMessage` → `onMessageProcessed`
- ✅ Validación de payload
- ✅ Mejor extracción de lógica
- ✅ Manejo de errores centralizado

**Antes:**
```typescript
async handleProcessedMessage(event) {
  const sentAt = typeof event.sentAt === 'string' 
    ? new Date(event.sentAt) 
    : event.sentAt;

  const messagePayload = { _id: event.id, ... };

  if (event.roomId) {
    this.messageBroker.sendToRoom(event.roomId, messagePayload);
  } else if (event.receiverId) {
    this.messageBroker.sendToUser(event.receiverId, messagePayload);
  }
}
```

**Después:**
```typescript
async onMessageProcessed(event) {
  try {
    this.validatePayload(event);
    const messagePayload = this.buildMessagePayload(event);
    
    if (event.roomId) {
      this.messageBroker.sendToRoom(event.roomId, messagePayload);
    } else if (event.receiverId) {
      this.messageBroker.sendToUser(event.receiverId, messagePayload);
    } else {
      this.logger.warn('Missing roomId or receiverId');
    }
  } catch (error) {
    this.logger.error(`Error: ${error.message}`);
    throw error;
  }
}

private validatePayload(event): void {
  if (!event.id || !event.senderId || !event.content) {
    throw new Error('Invalid payload: missing required fields');
  }
}

private buildMessagePayload(event): any {
  return { _id: event.id, ... };
}
```

### 5. Refactorización del Gateway

**Archivo:** `chat.gateway.ts`

**Cambios:**
- ✅ Inyecta IEventProducer en lugar de WsKafkaProducer
- ✅ Desacoplado de Kafka completamente
- ✅ Usa `@Inject(EVENT_PRODUCER)`

**Antes:**
```typescript
constructor(
  ...
  private readonly kafkaProducer: WsKafkaProducer,
) {}

async handleSendMessage(data, client) {
  await this.kafkaProducer.publishMessageCreated({...});
}
```

**Después:**
```typescript
constructor(
  ...
  @Inject(EVENT_PRODUCER) private readonly eventProducer: IEventProducer,
) {}

async handleSendMessage(data, client) {
  await this.eventProducer.publishMessageCreated({...});
}
```

### 6. Actualización del Module

**Archivo:** `chat.module.ts`

**Cambios:**
- ✅ Agregada inyección de EVENT_PRODUCER
- ✅ WsKafkaProducer proveído como EVENT_PRODUCER

```typescript
WsKafkaProducer,
{
  provide: EVENT_PRODUCER,
  useExisting: WsKafkaProducer,
},
```

### 7. Mejora de Services (Mejor Logging y Validación)

#### SessionService
- ✅ Logging mejorado (debug en lugar de silent)
- ✅ Validación de parámetros
- ✅ Try-catch en todos los métodos
- ✅ Mensajes de advertencia claros

#### TypingService
- ✅ Try-catch envolviendo toda la lógica
- ✅ Validación de userId
- ✅ Manejo de casos sin roomId ni receiverId
- ✅ Error handling consistente

#### MessageStatusService
- ✅ Try-catch en métodos públicos
- ✅ Validación de messageId y senderId
- ✅ Manejo de casos sin destino
- ✅ Logging de debug en lugar de info

---

## Beneficios de la Refactorización

### Desacoplamiento
✅ Gateway no conoce Kafka  
✅ Services no conocen Kafka  
✅ Fácil de testear sin Kafka  
✅ Fácil cambiar implementación de eventos  

### Clean Architecture
✅ Domain define contratos (interfaces)  
✅ Infrastructure implementa contratos  
✅ Application usa interfaces  
✅ Inversión de dependencias  

### Clean Code
✅ Métodos extraídos con responsabilidad única  
✅ Validación centralizada  
✅ Mejor error handling  
✅ Logging consistente  
✅ Documentación implícita en nombres  

### Mantenibilidad
✅ Más fácil debuggear  
✅ Más fácil agregar características  
✅ Más fácil cambiar tecnologías  
✅ Código más legible  

---

## Estructura Resultante

```
Domain (Interfaces - Sin dependencias externas)
├── IEventProducer
├── IEventConsumer
└── IEventBus

Application (Servicios - Usan interfaces)
├── SessionService
├── TypingService
├── MessageStatusService
└── WsMessageEventService

Infrastructure (Implementaciones concretas)
├── WsKafkaProducer (implementa IEventProducer)
├── WsKafkaConsumer
└── SocketIOMessageBroker
```

---

## Testing

Con esta estructura, ahora es posible:

```typescript
// Mock IEventProducer para tests
const mockProducer = {
  publishMessageCreated: jest.fn().mockResolvedValue(undefined),
};

// Gateway se prueba sin Kafka
const gateway = new ChatGateway(
  sessionService,
  typingService,
  messageStatusService,
  messageBroker,
  mockProducer, // Mock en lugar de WsKafkaProducer
);
```

---

## Migración Futura

Para cambiar de Kafka a otra tecnología:

1. Crear nueva clase que implemente IEventProducer
2. Actualizar module para usar la nueva implementación
3. No cambiar: Gateway, Services, Domain

**Ejemplo:**
```typescript
export class RabbitMQProducer implements IEventProducer {
  async publishMessageCreated(payload): Promise<void> {
    await this.channel.publish('message.created', payload);
  }
}

// En module:
{
  provide: EVENT_PRODUCER,
  useClass: RabbitMQProducer, // Cambiar aquí
}
```

---

## Conclusión

✅ **Antes**: Gateway altamente acoplado a Kafka  
✅ **Después**: Gateway agnóstico del evento bus  
✅ **Resultado**: Arquitectura escalable y mantenible

Los cambios mejoran significativamente la testabilidad y flexibilidad del sistema.
