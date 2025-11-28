import { Module } from '@nestjs/common';
import { ChatGateway } from './infrastructure/gateways/chat.gateway';
import { SessionService } from './application/services/session.service';
import { TypingService } from './application/services/typing.service';
import { MessageStatusService } from './application/services/message-status.service';
import { SocketIOMessageBroker } from './infrastructure/adapters/socketio-message-broker.adapter';
import { InMemorySessionManager } from './infrastructure/adapters/in-memory-session-manager.adapter';
import { MESSAGE_BROKER } from './domain/interfaces/message-broker.interface';
import { SESSION_MANAGER } from './domain/interfaces/session-manager.interface';
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
    SocketIOMessageBroker,
    {
      provide: MESSAGE_BROKER,
      useExisting: SocketIOMessageBroker,
    },
    {
      provide: SESSION_MANAGER,
      useClass: InMemorySessionManager,
    },
    // Kafka client and event wiring
    {
      provide: 'KAFKA_CLIENT',
      useFactory: (configService: ConfigService) =>
        new Kafka({
          brokers: [configService.get<string>('KAFKA_BROKER') || 'kafka:9092'],
        }),
      inject: [ConfigService],
    },
    WsKafkaProducer,
    WsKafkaConsumer,
    WsMessageEventService,
  ],
  exports: [SessionService],
})
export class ChatModule {}
