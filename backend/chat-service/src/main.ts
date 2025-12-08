import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// This file bootstraps the Chat service using NestJS, sets up Swagger for API documentation, and enables global validation.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;
  
 app.enableCors({
   origin: [configService.get<string>('FRONTEND_URL') || 'http://localhost:5173'], 
  // credentials: true Use when JWT implemented
 });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Chat Service API')
    .setDescription('API documentation for the Chat Service')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(port, "0.0.0.0");

  console.log(`🚀 Chat Service running on http://localhost:${port}`);
}
bootstrap();
