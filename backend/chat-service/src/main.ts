import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('MONGO_URI:', process.env.MONGO_URI);
  const config = new DocumentBuilder()
    .setTitle('Chat Service API')
    .setDescription('API documentation for the Chat Service')
    .setVersion('1.0')
    .addTag('rooms') // opcional, puedes agregar etiquetas por módulo
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // <-- esto define el endpoint /api
  await app.listen(3002);


  console.log(`🚀 Server running on http://localhost:3002`);
  console.log(`📘 Swagger docs available at http://localhost:3002/api`);
}
bootstrap();
