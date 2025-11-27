# 🧪 Guía de Pruebas - WebSocket Service

## 📋 Pre-requisitos

Antes de probar, asegúrate de tener:

1. ✅ **chat-service** corriendo en `http://localhost:3000`
2. ✅ **web-sockets-service** corriendo en `http://localhost:3001`
3. ✅ Al menos **una sala creada** en chat-service (anota el `_id`)

---

## 🚀 Método 1: Archivo HTML (Recomendado)

### Pasos:

1. **Iniciar los servicios**:
```bash
# Terminal 1 - Chat Service
cd backend/chat-service
npm run start:dev

# Terminal 2 - WebSocket Service
cd backend/web-sockets-service
npm run start:dev
```

2. **Abrir el archivo HTML**:
   - Ubicación: `backend/web-sockets-service/test-websocket.html`
   - Doble clic o abrirlo en tu navegador

3. **Probar la conexión**:
   - User ID: `user123` (o el que quieras)
   - Click en **"Conectar"**
   - Verás: ✅ "Registrado como: user123"

4. **Crear una sala en chat-service** (si no tienes):
```bash
# POST http://localhost:3000/rooms
{
  "name": "Sala de Pruebas",
  "description": "Para testing de WebSockets",
  "members": ["user123", "user456"],
  "createdBy": "user123"
}

# Anota el _id que retorna, ejemplo: "673c9b5f8e4a1b2c3d4e5f60"
```

5. **Unirse a la sala**:
   - Room ID: `673c9b5f8e4a1b2c3d4e5f60` (el que obtuviste)
   - Click en **"Unirse a Sala"**
   - Verás: ✅ "Te uniste a la sala"

6. **Enviar mensaje**:
   - Escribe en "Mensaje para Sala": `Hola desde WebSockets!`
   - Click en **"Enviar a Sala"**
   - Verás:
     - ✅ "Mensaje enviado exitosamente"
     - 📬 "NUEVO MENSAJE" con el contenido y el `_id` de MongoDB

7. **Probar en múltiples pestañas**:
   - Abre otra pestaña del navegador con el mismo HTML
   - User ID: `user456`
   - Únete a la misma sala
   - Los mensajes se verán en **ambas pestañas** en tiempo real 🎉

---

## 🔥 Método 2: Postman

### Configuración:

1. **Crear WebSocket Request**:
   - New → WebSocket Request
   - URL: `ws://localhost:3001`
   - Click "Connect"

2. **Registrar usuario**:
```json
{
  "event": "register",
  "data": {
    "userId": "user123"
  }
}
```

3. **Unirse a sala**:
```json
{
  "event": "joinRoom",
  "data": {
    "roomId": "673c9b5f8e4a1b2c3d4e5f60",
    "userId": "user123"
  }
}
```

4. **Enviar mensaje a sala**:
```json
{
  "event": "sendMessage",
  "data": {
    "senderId": "user123",
    "roomId": "673c9b5f8e4a1b2c3d4e5f60",
    "content": "Hola desde Postman!"
  }
}
```

5. **Enviar mensaje privado**:
```json
{
  "event": "sendMessage",
  "data": {
    "senderId": "user123",
    "receiverId": "user456",
    "content": "Mensaje privado desde Postman!"
  }
}
```

---

## 🧪 Método 3: Script de Node.js

Crea un archivo `test-client.js`:

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('✅ Conectado');
  
  // Registrar
  socket.emit('register', { userId: 'test-user' });
});

socket.on('registered', (data) => {
  console.log('✅ Registrado:', data);
  
  // Unirse a sala
  socket.emit('joinRoom', {
    roomId: '673c9b5f8e4a1b2c3d4e5f60',
    userId: 'test-user'
  });
});

socket.on('joinedRoom', (data) => {
  console.log('✅ Unido a sala:', data);
  
  // Enviar mensaje
  socket.emit('sendMessage', {
    senderId: 'test-user',
    roomId: '673c9b5f8e4a1b2c3d4e5f60',
    content: 'Hola desde Node.js!'
  });
});

socket.on('newMessage', (data) => {
  console.log('📬 Nuevo mensaje:', data);
});

socket.on('messageSent', (data) => {
  console.log('✅ Mensaje enviado:', data);
});

socket.on('messageError', (data) => {
  console.error('❌ Error:', data);
});
```

Ejecutar:
```bash
npm install socket.io-client
node test-client.js
```

---

## 📊 Verificar Persistencia

1. **Ver mensajes en MongoDB**:
```bash
# Conectar a MongoDB
mongosh

# Usar base de datos
use chat-db

# Ver mensajes
db.messages.find().pretty()
```

2. **Verificar con REST API de chat-service**:
```bash
# GET todos los mensajes
curl http://localhost:3000/messages

# GET mensajes de una sala
curl http://localhost:3000/messages/room/673c9b5f8e4a1b2c3d4e5f60
```

---

## 🎯 Escenarios de Prueba

### ✅ Caso 1: Mensaje a Sala Existente
- Crear sala en chat-service
- Conectar usuario
- Unirse a sala
- Enviar mensaje
- **Esperado**: Mensaje se guarda en MongoDB y se envía en tiempo real

### ✅ Caso 2: Mensaje a Sala Inexistente
- Intentar enviar mensaje a sala que no existe
- **Esperado**: Error "Room does not exist"

### ✅ Caso 3: Mensaje Privado
- Conectar dos usuarios (dos pestañas)
- Enviar mensaje privado de user1 a user2
- **Esperado**: Solo user2 recibe el mensaje

### ✅ Caso 4: Múltiples Usuarios en Sala
- Conectar 3+ usuarios a la misma sala
- Enviar mensaje desde uno
- **Esperado**: TODOS reciben el mensaje en tiempo real

### ✅ Caso 5: Usuario Desconectado
- Enviar mensaje privado a usuario offline
- **Esperado**: Mensaje se guarda pero no se envía en tiempo real (usuario lo verá al conectarse)

---

## 🐛 Troubleshooting

### Error: "Connection refused"
```bash
# Verificar que web-sockets-service esté corriendo
curl http://localhost:3001

# Ver logs
cd backend/web-sockets-service
npm run start:dev
```

### Error: "Room does not exist"
```bash
# Verificar que chat-service esté corriendo
curl http://localhost:3000/rooms

# Crear sala si no existe
curl -X POST http://localhost:3000/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Room",
    "members": ["user123"],
    "createdBy": "user123"
  }'
```

### Error: CORS
- Verificar que `cors: { origin: '*' }` esté en `ChatGateway`
- Reiniciar web-sockets-service

---

## 📝 Variables de Entorno

Crear archivo `.env` en `web-sockets-service`:
```bash
CHAT_SERVICE_URL=http://localhost:3000
PORT=3001
```

---

## ✅ Checklist de Pruebas

- [ ] Conectar usuario
- [ ] Registrar usuario
- [ ] Unirse a sala
- [ ] Enviar mensaje a sala
- [ ] Recibir mensaje en tiempo real
- [ ] Verificar mensaje en MongoDB
- [ ] Enviar mensaje privado
- [ ] Múltiples usuarios en sala
- [ ] Indicador de "escribiendo"
- [ ] Salir de sala
- [ ] Desconectar usuario
- [ ] Validación de sala inexistente
- [ ] Validación de usuario inexistente

---

## 🎉 Listo!

Ahora puedes probar completamente tu sistema de WebSockets con integración a chat-service y persistencia en MongoDB.
