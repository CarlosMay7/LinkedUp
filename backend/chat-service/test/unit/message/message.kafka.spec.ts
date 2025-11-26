import { MessageEventService } from '../../../src/modules/message/infrastructure/events/message-event.service';
import { MessageKafkaProducer } from '../../../src/modules/message/infrastructure/events/Kafka/message.kafka.producer';
import { MessageKafkaAdapter } from '../../../src/modules/message/infrastructure/events/Kafka/message.kafka.adapter';
import { MessageMapper } from '../../../src/modules/message/infrastructure/mappers/message.mapper';
import { MessageEntity } from '../../../src/modules/message/domain/entities/message.entity';
import { Types } from 'mongoose';
import { MessageResponseDto } from 'src/modules/message/infrastructure/controllers/dto/message-response.dto';

const mockMessageEntity = new MessageEntity(
  '550e8400-e29b-41d4-a716-446655440001',
  'Test message content',
  new Date(),
  new Types.ObjectId().toString(),
  new Types.ObjectId().toString(),
  undefined,
);

describe('Kafka integrations (unit)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('MessageEventService', () => {
    it('should map payload to DTO, call use-case and publish processed message', async () => {
      const created = new MessageEntity(
        '550e8400-e29b-41d4-a716-446655440001',
        'created content',
        new Date(),
        undefined,
        undefined,
        undefined,
      );

      const mockCreateUseCase = { execute: jest.fn().mockResolvedValue(created) } as any;
      const mockPublisher = { publishProcessedMessage: jest.fn().mockResolvedValue(undefined) } as any;

      const svc = new MessageEventService(mockCreateUseCase, mockPublisher);

      const payload = {
        content: 'hello world',
        senderId: '550e8400-e29b-41d4-a716-446655440001',
        roomId: new Types.ObjectId().toString(),
        receiverId: undefined,
      };

      await svc.handleIncomingEvent(payload);

      expect(mockCreateUseCase.execute).toHaveBeenCalledWith({
        content: payload.content,
        senderId: payload.senderId,
        roomId: payload.roomId,
        receiverId: payload.receiverId,
      });
      expect(mockPublisher.publishProcessedMessage).toHaveBeenCalledWith(created);
    });
  });

  describe('MessageKafkaAdapter', () => {
    it('should call producer.publish with the processed topic and entity', async () => {
      const producerMock = { publish: jest.fn().mockResolvedValue(undefined) } as any;
      const adapter = new MessageKafkaAdapter(producerMock);

      const entity = new MessageEntity(
        mockMessageEntity.senderId,
        'content',
        new Date(),
        undefined,
        undefined,
        undefined,
      );

      await adapter.publishProcessedMessage(entity);

      expect(producerMock.publish).toHaveBeenCalledWith('message.processed', entity);
    });
  });

  describe('MessageKafkaProducer', () => {
    it('should connect, send serialized message and disconnect', async () => {
      const producedDto = { id: 'x', content: 'c' };
      jest.spyOn(MessageMapper, 'toDto').mockReturnValue(producedDto as any);

      const producer = {
        connect: jest.fn().mockResolvedValue(undefined),
        send: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined),
      };
      const kafkaClient = { producer: () => producer } as any;

      const kafkaProducer = new MessageKafkaProducer(kafkaClient);

      const messageEntity = new MessageEntity(
        mockMessageEntity.senderId,
        'content',
        new Date(),
        undefined,
        undefined,
        undefined,
      );

      const messageDto = MessageMapper.toDto(messageEntity);

      await kafkaProducer.publish('some.topic', messageDto);

      expect(producer.connect).toHaveBeenCalled();
      expect(producer.send).toHaveBeenCalledWith({
        topic: 'some.topic',
        messages: [{ value: JSON.stringify(producedDto) }],
      });
      expect(producer.disconnect).toHaveBeenCalled();

      (MessageMapper.toDto as jest.Mock).mockRestore();
    });
  });
});