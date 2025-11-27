import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Kafka } from 'kafkajs';

// Infrastructure
import {
  Message,
  MessageSchema,
} from './infrastructure/persistence/schemas/message.schema';
import { MessageMongoRepository } from './infrastructure/persistence/message.mongo.repository';
import { MessageController } from './infrastructure/controllers/message.controller';
//KAFFA
import { MESSAGE_EVENT_ADAPTER } from './infrastructure/events/message-event.adapter';
import { MessageEventService } from './infrastructure/events/message-event.service';
import { MessageKafkaAdapter } from './infrastructure/events/Kafka/message.kafka.adapter';
import { MessageKafkaProducer } from './infrastructure/events/Kafka/message.kafka.producer';
import { MessageKafkaConsumer } from './infrastructure/events/Kafka/message.kafka.consumer';

// Domain
import { MESSAGE_REPOSITORY } from './domain/interfaces/message.repository';
import { CreateMessageUseCase } from './domain/use-cases/create-message.use-case';
import { FindAllMessagesUseCase } from './domain/use-cases/find-all-messages.use-case';
import { FindMessageByIdUseCase } from './domain/use-cases/find-message-by-id.use-case';
import { FindMessagesByUsersUseCase } from './domain/use-cases/find-messages-by-users.use-case';
import { FindConversationUseCase } from './domain/use-cases/find-conversation.use-case';
import { FindMessagesByRoomUseCase } from './domain/use-cases/find-messages-by-room.use-case';
import { UpdateMessageUseCase } from './domain/use-cases/update-message.use-case';
import { DeleteMessageUseCase } from './domain/use-cases/delete-message.use-case';
import { DeleteMessagesByRoomUseCase } from './domain/use-cases/delete-messages-by-room.use-case';

// Common
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    CommonModule,
  ],
  controllers: [MessageController],
  providers: [
    // Repository
    {
      provide: MESSAGE_REPOSITORY,
      useClass: MessageMongoRepository,
    },
    //event handler
    MessageEventService,
    {
      provide: 'KAFKA_CLIENT',
      useFactory: () => new Kafka({ brokers: ['localhost:29092'] }),
    },
    {
      provide: MESSAGE_EVENT_ADAPTER,
      useClass: MessageKafkaAdapter,
    },
    // Kafka Infrastructure
    MessageKafkaProducer,
    MessageKafkaConsumer,
    // Use Cases
    CreateMessageUseCase,
    FindAllMessagesUseCase,
    FindMessageByIdUseCase,
    FindMessagesByUsersUseCase,
    FindConversationUseCase,
    FindMessagesByRoomUseCase,
    UpdateMessageUseCase,
    DeleteMessageUseCase,
    DeleteMessagesByRoomUseCase,
  ],
  exports: [
    MESSAGE_REPOSITORY,
    CreateMessageUseCase,
    FindAllMessagesUseCase,
    FindMessageByIdUseCase,
    FindMessagesByUsersUseCase,
    FindConversationUseCase,
    FindMessagesByRoomUseCase,
    UpdateMessageUseCase,
    DeleteMessageUseCase,
    DeleteMessagesByRoomUseCase,
  ],
})
export class MessageModule {}
