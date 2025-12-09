import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SocketIOAdapter } from './modules/chat/infrastructure/adapters/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable DTO validation for WebSocket messages (transform + whitelist)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Configure WebSocket adapter (Socket.IO se maneja automáticamente con NestJS)
  app.useWebSocketAdapter(new SocketIOAdapter(app));

  // Enable CORS (una sola vez, aquí)
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  const port = process.env.PORT || 3002;
  await app.listen(port);

  console.log(`🚀 WebSocket Service running on http://localhost:${port}`);
}

bootstrap();
