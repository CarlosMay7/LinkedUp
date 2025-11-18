import { RoomEntity } from '../../domain/entities/room.entity';
import { RoomResponseDto } from '../controllers/dto/dto/room-response.dto';

export class RoomMapper {
  static toDto(entity: RoomEntity): RoomResponseDto {
    const dto = new RoomResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.members = entity.members;
    dto.createdBy = entity.createdBy;
    return dto;
  }

  static toDtoArray(entities: RoomEntity[]): RoomResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
