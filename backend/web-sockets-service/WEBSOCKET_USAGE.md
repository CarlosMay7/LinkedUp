# WebSocket Chat Service

Servicio de WebSockets para mensajería en tiempo real usando Socket.IO.

## Eventos del Cliente → Servidor

### 1. **register** - Registrar usuario
Registra un usuario con su socket para recibir mensajes privados.

```javascript
socket.emit('register', {
  userId: 'user-uuid'
});
```

### 2. **joinRoom** - Unirse a una sala
```javascript
socket.emit('joinRoom', {
  roomId: 'room-id',
  userId: 'user-uuid'
});
```

### 3. **leaveRoom** - Salir de una sala
```javascript
socket.emit('leaveRoom', {
  roomId: 'room-id',
  userId: 'user-uuid'
});
```

### 4. **sendMessage** - Enviar mensaje
**Mensaje a sala:**
```javascript
socket.emit('sendMessage', {
  roomId: 'room-id',
  senderId: 'user-uuid',
  content: 'Hola a todos!'
});
```

**Mensaje privado:**
```javascript
socket.emit('sendMessage', {
  senderId: 'user-uuid',
  receiverId: 'receiver-uuid',
  content: 'Hola!'
});
```

### 5. **typing** - Indicador de escritura
**En sala:**
```javascript
socket.emit('typing', {
  roomId: 'room-id',
  userId: 'user-uuid',
  isTyping: true
});
```

**Privado:**
```javascript
socket.emit('typing', {
  userId: 'user-uuid',
  receiverId: 'receiver-uuid',
  isTyping: true
});
```

### 6. **messageDelivered** - Confirmar entrega
```javascript
socket.emit('messageDelivered', {
  messageId: 'message-id',
  userId: 'user-uuid'
});
```

### 7. **messageRead** - Confirmar lectura
```javascript
socket.emit('messageRead', {
  messageId: 'message-id',
  userId: 'user-uuid'
});
```

### 8. **getOnlineUsers** - Obtener usuarios en línea
```javascript
socket.emit('getOnlineUsers', {
  roomId: 'room-id'
});
```

## Eventos del Servidor → Cliente

### 1. **registered** - Confirmación de registro
```javascript
socket.on('registered', (data) => {
  console.log('Registrado:', data.userId);
});
```

### 2. **joinedRoom** - Confirmación de unión a sala
```javascript
socket.on('joinedRoom', (data) => {
  console.log('Unido a sala:', data.roomId);
});
```

### 3. **userJoined** - Otro usuario se unió
```javascript
socket.on('userJoined', (data) => {
  console.log(`Usuario ${data.userId} se unió a ${data.roomId}`);
});
```

### 4. **leftRoom** - Confirmación de salida
```javascript
socket.on('leftRoom', (data) => {
  console.log('Saliste de la sala:', data.roomId);
});
```

### 5. **userLeft** - Otro usuario salió
```javascript
socket.on('userLeft', (data) => {
  console.log(`Usuario ${data.userId} salió de ${data.roomId}`);
});
```

### 6. **newMessage** - Nuevo mensaje recibido
```javascript
socket.on('newMessage', (message) => {
  console.log('Nuevo mensaje:', message);
  // message = {
  //   messageId: string,
  //   roomId?: string,
  //   senderId: string,
  //   receiverId?: string,
  //   content: string,
  //   timestamp: Date
  // }
});
```

### 7. **messageSent** - Confirmación de envío
```javascript
socket.on('messageSent', (message) => {
  console.log('Mensaje enviado:', message);
});
```

### 8. **userTyping** - Usuario escribiendo
```javascript
socket.on('userTyping', (data) => {
  console.log(`${data.userId} está escribiendo...`);
});
```

### 9. **deliveryConfirmation** - Confirmación de entrega
```javascript
socket.on('deliveryConfirmation', (data) => {
  console.log(`Mensaje ${data.messageId} entregado a ${data.userId}`);
});
```

### 10. **readConfirmation** - Confirmación de lectura
```javascript
socket.on('readConfirmation', (data) => {
  console.log(`Mensaje ${data.messageId} leído por ${data.userId}`);
});
```

### 11. **onlineUsers** - Lista de usuarios en línea
```javascript
socket.on('onlineUsers', (data) => {
  console.log('Usuarios en línea:', data.onlineUsers);
});
```

## Ejemplo de uso completo (Cliente JavaScript/TypeScript)

```typescript
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:3003');

// 1. Registrarse al conectar
socket.on('connect', () => {
  console.log('Conectado:', socket.id);
  
  socket.emit('register', {
    userId: 'user-123'
  });
});

// 2. Unirse a una sala
socket.emit('joinRoom', {
  roomId: 'room-abc',
  userId: 'user-123'
});

// 3. Escuchar nuevos mensajes
socket.on('newMessage', (message) => {
  console.log('Nuevo mensaje:', message.content);
  
  // Confirmar entrega
  socket.emit('messageDelivered', {
    messageId: message.messageId,
    userId: 'user-123'
  });
});

// 4. Enviar mensaje
socket.emit('sendMessage', {
  roomId: 'room-abc',
  senderId: 'user-123',
  content: '¡Hola a todos!'
});

// 5. Indicar que estás escribiendo
socket.emit('typing', {
  roomId: 'room-abc',
  userId: 'user-123',
  isTyping: true
});

// 6. Manejar desconexión
socket.on('disconnect', () => {
  console.log('Desconectado');
});
```

## Configuración

El servicio corre en el puerto **3003** por defecto.

Para cambiar el puerto, edita `src/main.ts`:
```typescript
await app.listen(3003); // Cambia el puerto aquí
```

## CORS

Actualmente está configurado para aceptar conexiones de cualquier origen (`origin: '*'`).

Para producción, configura orígenes específicos en `chat.gateway.ts`:
```typescript
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://tu-dominio.com'],
    credentials: true
  }
})
```

## Testing

Para probar el servicio, puedes usar herramientas como:
- [Socket.IO Client Tool](https://amritb.github.io/socketio-client-tool/)
- Postman (soporta WebSockets)
- O crear un cliente simple en HTML/JS
