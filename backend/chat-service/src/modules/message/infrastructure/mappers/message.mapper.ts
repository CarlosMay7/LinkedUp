import { MessageEntity } from '../../domain/entities/message.entity';
import { MessageResponseDto } from '../controllers/dto/message-response.dto';

export class MessageMapper {
  static toDto(entity: MessageEntity): MessageResponseDto {
    return {
      id: entity.id!,
      roomId: entity.roomId,
      senderId: entity.senderId,
      receiverId: entity.receiverId,
      content: entity.content,
      sentAt: entity.sentAt,
    };
  }

  static toDtoArray(entities: MessageEntity[]): MessageResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
