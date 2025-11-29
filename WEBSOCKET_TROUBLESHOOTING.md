# Guía de Troubleshooting - Error de WebSocket Timeout

## Problema
```
WebSocketContext.jsx:43 Error connecting WebSocket: Error: Timeout initializing WebSocket
```

Este error indica que el frontend no puede conectarse al servicio de WebSocket en el backend.

## Causas Comunes

1. **WebSocket Service no está corriendo**
2. **Puerto 3002 no está disponible**
3. **CORS no configurado correctamente**
4. **Dirección URL del WebSocket es incorrecta**

## Soluciones

### 1. Verificar que el WebSocket Service está corriendo

#### Opción A: Correr en desarrollo local

```bash
cd backend/web-sockets-service
npm install
npm run start:dev
```

Deberías ver un mensaje como:
```
WebSocket Service running on http://localhost:3002
WebSocket endpoint: ws://localhost:3002/socket.io
```

#### Opción B: Correr con Docker Compose

Agrega el servicio al `docker-compose.yml`:

```yaml
web-sockets-service:
  build: ./backend/web-sockets-service
  container_name: web-sockets-service
  ports:
    - "3002:3002"
  environment:
    PORT: 3002
    KAFKA_BROKER: kafka:9092
  depends_on:
    - kafka
  networks:
    - linkedup-network
```

Luego ejecuta:
```bash
docker compose up --build web-sockets-service
```

### 2. Verificar que el puerto 3002 está disponible

#### Windows PowerShell:
```powershell
netstat -ano | Select-String ":3002"
```

Si sale algo, hay algo usando el puerto. Para liberar:
```powershell
# Encontrar el PID (Process ID)
$process = Get-Process | Where-Object { $_.Name -eq "node" }
Stop-Process -Id $process.Id -Force
```

#### Linux/Mac:
```bash
lsof -i :3002
```

### 3. Verificar la URL del WebSocket

El frontend intenta conectar a:
```
http://localhost:3002
```

Puedes cambiar esto en las variables de entorno del frontend (`.env`):
```
VITE_WEBSOCKET_URL=http://localhost:3002
```

### 4. Verificar CORS

El WebSocket service debe permitir conexiones desde tu dominio. Verifica en `backend/web-sockets-service/src/main.ts`:

```typescript
app.enableCors({
    origin: '*',  // Esto permite todas las fuentes
    credentials: true,
});
```

## Cómo saber si WebSocket está funcionando

### Opción 1: Usar el cliente de prueba HTML

Navega a:
```
backend/web-sockets-service/websocket-test-client.html
```

Abre el archivo en el navegador y prueba la conexión.

### Opción 2: Verificar en la consola del navegador

Abre las DevTools (F12) → Console y verifica:
1. Que no hay errores de CORS
2. Que aparece un mensaje: "WebSocket connected: [socket-id]"

### Opción 3: Usar curl para verificar

```bash
curl -i http://localhost:3002/socket.io/?transport=websocket
```

## Estado Actual

- ✅ El timeout se ha aumentado de 5s a 15s
- ✅ Ahora hay reintentos automáticos con backoff exponencial
- ✅ El app funciona aunque WebSocket falle (sin funciones real-time)
- ⚠️ El WebSocket Service necesita estar corriendo para chat en tiempo real

## Próximos Pasos

1. Inicia el WebSocket service en el puerto 3002
2. Recarga el navegador
3. Verifica en la consola que la conexión es exitosa
4. Si el problema persiste, revisa los logs del WebSocket service

## Logs Útiles

### Frontend (Console del navegador):
```javascript
// Si ves estos mensajes, todo está bien:
"WebSocket connected: [socket-id]"

// Si ves este error, el servidor no está accesible:
"Error connecting WebSocket: Error: Timeout initializing WebSocket"
```

### Backend (Terminal):
```
WebSocket Service running on http://localhost:3002
Client connected: [socket-id]
```

## Archivos Relevantes

- Frontend WebSocket Setup: `frontend/src/chat/context/WebSocketContext.jsx`
- WebSocket Repository: `frontend/src/infrastructure/repositories/websocket.repository.js`
- Initialize Use Case: `frontend/src/core/use-cases/chat/initialize-websocket.use-case.js`
- WebSocket Gateway: `backend/web-sockets-service/src/modules/chat/infrastructure/gateways/chat.gateway.ts`
- WebSocket Main: `backend/web-sockets-service/src/main.ts`
