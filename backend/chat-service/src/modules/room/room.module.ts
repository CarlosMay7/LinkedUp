import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Infrastructure
import {
  Room,
  RoomSchema,
} from './infrastructure/persistence/schemas/room.schema';
import { RoomMongoRepository } from './infrastructure/persistence/room.mongo.repository';
import { RoomController } from './infrastructure/controllers/room.controller';

// Domain
import { ROOM_REPOSITORY } from './domain/interfaces/room.repository';
import { CreateRoomUseCase } from './domain/use-cases/create-room.use-case';
import { FindAllRoomsUseCase } from './domain/use-cases/find-all-rooms.use-case';
import { FindRoomByIdUseCase } from './domain/use-cases/find-room-by-id.use-case';
import { UpdateRoomUseCase } from './domain/use-cases/update-room.use-case';
import { AddMemberUseCase } from './domain/use-cases/add-member.use-case';
import { RemoveMemberUseCase } from './domain/use-cases/remove-member.use-case';
import { FindRoomsByMemberUseCase } from './domain/use-cases/find-rooms-by-member.use-case';
import { DeleteRoomUseCase } from './domain/use-cases/delete-room.use-case';

// Common
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
    CommonModule,
  ],
  controllers: [RoomController],
  providers: [
    // Repository
    {
      provide: ROOM_REPOSITORY,
      useClass: RoomMongoRepository,
    },
    // Use Cases
    CreateRoomUseCase,
    FindAllRoomsUseCase,
    FindRoomByIdUseCase,
    UpdateRoomUseCase,
    AddMemberUseCase,
    RemoveMemberUseCase,
    FindRoomsByMemberUseCase,
    DeleteRoomUseCase,
  ],
  exports: [
    ROOM_REPOSITORY,
    CreateRoomUseCase,
    FindAllRoomsUseCase,
    FindRoomByIdUseCase,
    UpdateRoomUseCase,
    AddMemberUseCase,
    RemoveMemberUseCase,
    FindRoomsByMemberUseCase,
    DeleteRoomUseCase,
  ],
})
export class RoomModule {}
