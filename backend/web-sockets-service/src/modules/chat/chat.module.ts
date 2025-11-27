import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChatGateway } from './infrastructure/gateways/chat.gateway';
import { MessageService } from './application/services/message.service';
import { SessionService } from './application/services/session.service';
import { TypingService } from './application/services/typing.service';
import { MessageStatusService } from './application/services/message-status.service';
import { SocketIOMessageBroker } from './infrastructure/adapters/socketio-message-broker.adapter';
import { InMemorySessionManager } from './infrastructure/adapters/in-memory-session-manager.adapter';
import { ChatServiceMessageRepository } from './infrastructure/adapters/chat-service-message-repository.adapter';
import { MESSAGE_BROKER } from './domain/interfaces/message-broker.interface';
import { SESSION_MANAGER } from './domain/interfaces/session-manager.interface';
import { MESSAGE_REPOSITORY } from './domain/interfaces/message-repository.interface';

@Module({
  imports: [HttpModule],
  providers: [
    ChatGateway,
    MessageService,
    SessionService,
    TypingService,
    MessageStatusService,
    SocketIOMessageBroker, // Single instance
    {
      provide: MESSAGE_BROKER,
      useExisting: SocketIOMessageBroker, // Use the same instance
    },
    {
      provide: SESSION_MANAGER,
      useClass: InMemorySessionManager,
    },
    {
      provide: MESSAGE_REPOSITORY,
      useClass: ChatServiceMessageRepository,
    },
  ],
  exports: [MessageService, SessionService],
})
export class ChatModule {}
