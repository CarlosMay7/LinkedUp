import { Module } from '@nestjs/common';
import { ChatGateway } from './infrastructure/gateways/chat.gateway';
import { SessionService } from './application/services/session.service';
import { TypingService } from './application/services/typing.service';
import { MessageStatusService } from './application/services/message-status.service';
import { MessageIdService } from './application/services/message-id.service';
import { OnlineUsersService } from './application/services/online-users.service';
import { SocketIOMessageBroker } from './infrastructure/adapters/socketio-message-broker.adapter';
import { InMemorySessionManager } from './infrastructure/adapters/in-memory-session-manager.adapter';
import { MESSAGE_BROKER } from './domain/interfaces/message-broker.interface';
import { SESSION_MANAGER } from './domain/interfaces/session-manager.interface';
import { EVENT_PRODUCER } from './domain/interfaces/event-producer.interface';
import { EVENT_CONSUMER } from './domain/interfaces/event-consumer.interface';
import { ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';
import { WsKafkaProducer } from './infrastructure/events/Kafka/ws.kafka.producer';
import { WsKafkaConsumer } from './infrastructure/events/Kafka/ws.kafka.consumer';
import { WsMessageEventService } from './infrastructure/events/message-event.service';

@Module({
  imports: [],
  providers: [
    ChatGateway,
    SessionService,
    TypingService,
    MessageStatusService,
    MessageIdService,
    OnlineUsersService,
    SocketIOMessageBroker,
    {
      provide: MESSAGE_BROKER,
      useExisting: SocketIOMessageBroker,
    },
    {
      provide: SESSION_MANAGER,
      useClass: InMemorySessionManager,
    },
    // Kafka client
    {
      provide: 'KAFKA_CLIENT',
      useFactory: (configService: ConfigService) =>
        new Kafka({
          brokers: [configService.get<string>('KAFKA_BROKER') || 'kafka:9092'],
        }),
      inject: [ConfigService],
    },
    WsKafkaProducer,
    {
      provide: EVENT_PRODUCER,
      useExisting: WsKafkaProducer,
    },
    WsKafkaConsumer,
    WsMessageEventService,
    {
      provide: EVENT_CONSUMER,
      useExisting: WsMessageEventService,
    },
  ],
  exports: [SessionService],
})
export class ChatModule {}
