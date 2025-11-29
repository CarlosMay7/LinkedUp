# 🧪 Guía de Pruebas para WebSocket Service

## 📋 Descripción

Esta guía te muestra cómo probar el **web-sockets-service** de LinkedUp usando el cliente HTML interactivo incluido.

---

## 🚀 Paso 1: Iniciar el WebSocket Service

### Opción A: Modo Desarrollo (recomendado para testing)

```powershell
# Navegar al directorio del servicio
cd backend\web-sockets-service

# Instalar dependencias (si aún no lo has hecho)
npm install

# Iniciar en modo desarrollo con auto-reload
npm run start:dev
```

El servicio se iniciará en `http://localhost:3002` con endpoint WebSocket en `ws://localhost:3002/socket.io`

### Opción B: Usando Docker Compose

```powershell
# Desde la raíz del proyecto
docker compose up web-sockets-service --build
```

### Verificar que el servicio está corriendo

Deberías ver en la consola:
```
WebSocket Service running on http://localhost:3002
WebSocket endpoint: ws://localhost:3002/socket.io
```

---

## 🌐 Paso 2: Abrir el Cliente de Prueba

1. Abre el archivo `websocket-test-client.html` en tu navegador:
   - **Opción 1**: Doble clic en el archivo
   - **Opción 2**: Arrastra el archivo al navegador
   - **Opción 3**: Abre desde VS Code con Live Server (si lo tienes instalado)

2. El cliente se abrirá con una interfaz visual moderna que muestra:
   - Panel de conexión
   - Panel de registro de usuario
   - Panel de gestión de salas
   - Panel de mensajes
   - Log de eventos en tiempo real

---

## 🔧 Paso 3: Probar Funcionalidades

### 3.1 Conectar al Servidor

1. Verifica que la URL del servidor sea `http://localhost:3002`
2. Haz clic en **"Conectar"**
3. Espera el mensaje de confirmación en el log: `✅ Conectado exitosamente!`

### 3.2 Registrar Usuario

1. Ingresa un ID de usuario (ej: `user-123`)
2. Haz clic en **"Registrar"**
3. Verifica en el log: `✅ Usuario registrado`

### 3.3 Unirse a una Sala

1. Ingresa un ID de sala (ej: `room-456`)
2. Haz clic en **"Unirse"**
3. Verifica en el log: `🏠 Te uniste a la sala`

### 3.4 Enviar Mensajes

1. (Opcional) Ingresa un ID de receptor para mensaje directo
2. Escribe un mensaje en el área de texto
3. Haz clic en **"Enviar Mensaje"**
4. Verifica en el log: `📤 Mensaje en cola`

### 3.5 Simular Usuario Escribiendo (Typing)

1. Haz clic en **"Simular Typing"**
2. Los demás usuarios en la sala recibirán el evento `typing`

### 3.6 Ver Usuarios Online

1. Haz clic en **"Ver Usuarios Online"**
2. El log mostrará la lista de usuarios conectados a la sala

---

## 🎭 Paso 4: Simular Múltiples Usuarios

Para probar interacciones entre usuarios:

1. **Abre múltiples pestañas** del navegador con el mismo archivo HTML
2. En cada pestaña:
   - Conecta con un **ID de usuario diferente** (ej: `user-1`, `user-2`, `user-3`)
   - Únete a la **misma sala** (ej: `room-general`)
3. Envía mensajes desde diferentes pestañas
4. Observa cómo los eventos se propagan entre usuarios:
   - `userJoined` cuando alguien se une
   - `userLeft` cuando alguien sale
   - `typing` cuando alguien escribe
   - `newMessage` cuando llega un mensaje nuevo

---

## 📡 Eventos Disponibles

### Eventos del Cliente → Servidor

| Evento | Parámetros | Descripción |
|--------|-----------|-------------|
| `register` | `{ userId }` | Registra un usuario en el sistema |
| `joinRoom` | `{ roomId, userId }` | Une al usuario a una sala |
| `leaveRoom` | `{ roomId, userId }` | Saca al usuario de una sala |
| `sendMessage` | `{ senderId, content, roomId, receiverId? }` | Envía un mensaje (se procesa vía Kafka) |
| `typing` | `{ userId, roomId, receiverId?, isTyping }` | Notifica que el usuario está escribiendo |
| `messageDelivered` | `{ messageId, userId }` | Marca un mensaje como entregado |
| `messageRead` | `{ messageId, userId }` | Marca un mensaje como leído |
| `getOnlineUsers` | `{ roomId }` | Obtiene usuarios online en una sala |

### Eventos del Servidor → Cliente

| Evento | Datos | Descripción |
|--------|-------|-------------|
| `registered` | `{ userId }` | Confirmación de registro |
| `joinedRoom` | `{ roomId, userId }` | Confirmación de unión a sala |
| `leftRoom` | `{ roomId, userId }` | Confirmación de salida de sala |
| `userJoined` | `{ roomId, userId, timestamp }` | Otro usuario se unió |
| `userLeft` | `{ roomId, userId, timestamp }` | Otro usuario salió |
| `messageQueued` | `{ status, roomId, receiverId }` | Mensaje enviado a Kafka |
| `newMessage` | `{ ... }` | Nuevo mensaje recibido (desde Kafka) |
| `messageError` | `{ error }` | Error al enviar mensaje |
| `typing` | `{ userId, roomId }` | Usuario está escribiendo |
| `messageDelivered` | `{ messageId }` | Mensaje entregado |
| `messageRead` | `{ messageId }` | Mensaje leído |
| `onlineUsers` | `{ data: string[] }` | Lista de usuarios online |

---

## 🐛 Troubleshooting

### Error: "No se puede conectar al servidor"

**Causa**: El servicio no está corriendo o el puerto es incorrecto

**Solución**:
- Verifica que el servicio esté corriendo en `http://localhost:3002`
- Revisa la consola del servicio para ver errores
- Prueba acceder a `http://localhost:3002` en el navegador

### Error: "CORS policy blocked"

**Causa**: Configuración CORS incorrecta

**Solución**:
- Verifica que el servicio tenga configurado `origin: '*'` en `main.ts`
- Reinicia el servicio después de cambios

### No recibo eventos de otros usuarios

**Causa**: No están en la misma sala o no se registraron correctamente

**Solución**:
- Asegúrate de que todos los usuarios ejecuten `register` primero
- Verifica que todos se unan a la misma sala con `joinRoom`
- Revisa el log del servidor para ver si hay errores

### Mensajes no se envían

**Causa**: Kafka no está corriendo o hay error en la configuración

**Solución**:
- Verifica que Kafka y Zookeeper estén corriendo:
  ```powershell
  docker compose up zookeeper kafka -d
  ```
- Revisa los logs del servicio para ver errores de Kafka
- El evento `messageQueued` debería aparecer inmediatamente aunque Kafka esté caído

---

## 📊 Ejemplo de Flujo Completo

```javascript
// Usuario 1 (Pestaña 1)
1. Conectar → http://localhost:3002
2. Registrar → userId: "alice"
3. Unirse → roomId: "general"
4. Enviar mensaje → "Hola a todos!"

// Usuario 2 (Pestaña 2)
1. Conectar → http://localhost:3002
2. Registrar → userId: "bob"
3. Unirse → roomId: "general"
4. Ver log → "👋 Usuario se unió: alice"
5. Simular typing
6. Enviar mensaje → "Hola Alice!"

// Ambos usuarios verán:
- ✅ Eventos de conexión
- 🏠 Eventos de unión a sala
- ⌨️ Eventos de typing
- 📨 Mensajes nuevos (cuando Kafka los procese)
```

---

## 🔍 Monitoreo Avanzado

### Ver logs del servidor

```powershell
# Si corriste con npm
# Los logs aparecen en la consola actual

# Si corriste con Docker
docker compose logs -f web-sockets-service
```

### Inspeccionar tráfico WebSocket

1. Abre DevTools del navegador (F12)
2. Ve a la pestaña **Network**
3. Filtra por **WS** (WebSocket)
4. Haz clic en la conexión de Socket.IO
5. Ve a la pestaña **Messages** para ver todos los eventos en tiempo real

---

## 📝 Notas Importantes

- **Kafka**: El servicio usa Kafka para procesar mensajes. Si Kafka no está corriendo, los mensajes se pondrán en cola pero no se procesarán completamente.
- **Persistencia**: Los mensajes se guardan en MongoDB vía el `chat-service` después de ser procesados por Kafka.
- **Socket IDs**: Cada conexión recibe un Socket ID único. Al desconectar, se limpia la sesión automáticamente.
- **Rooms**: Las salas de Socket.IO son virtuales. No necesitas crearlas previamente; se crean automáticamente al unirse.

---

## ✅ Checklist de Pruebas

- [ ] Conectar/desconectar múltiples veces
- [ ] Registrar usuario con diferentes IDs
- [ ] Unirse y salir de salas
- [ ] Enviar mensajes en sala
- [ ] Enviar mensaje directo (con receiverId)
- [ ] Simular typing
- [ ] Ver usuarios online
- [ ] Abrir 3+ pestañas y probar interacciones
- [ ] Verificar que eventos se propaguen correctamente
- [ ] Revisar logs del servidor para errores
- [ ] Probar reconexión automática (detener/iniciar servicio)

---

## 🎉 ¡Listo!

Ahora puedes probar todas las funcionalidades del WebSocket service de forma interactiva y visual. Si encuentras algún problema, revisa la sección de Troubleshooting o los logs del servidor.

**Happy Testing! 🚀**
