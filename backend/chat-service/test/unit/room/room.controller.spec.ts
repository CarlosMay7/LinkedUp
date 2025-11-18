import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from '../../../src/modules/room/infrastructure/controllers/room.controller';
import { CreateRoomDto } from '../../../src/modules/room/infrastructure/controllers/dto/dto/create-room.dto';
import { UpdateRoomDto } from '../../../src/modules/room/infrastructure/controllers/dto/dto/update-room.dto';
import { RoomEntity } from '../../../src/modules/room/domain/entities/room.entity';
import { CreateRoomUseCase } from '../../../src/modules/room/domain/use-cases/create-room.use-case';
import { FindAllRoomsUseCase } from '../../../src/modules/room/domain/use-cases/find-all-rooms.use-case';
import { FindRoomByIdUseCase } from '../../../src/modules/room/domain/use-cases/find-room-by-id.use-case';
import { UpdateRoomUseCase } from '../../../src/modules/room/domain/use-cases/update-room.use-case';
import { AddMemberUseCase } from '../../../src/modules/room/domain/use-cases/add-member.use-case';
import { RemoveMemberUseCase } from '../../../src/modules/room/domain/use-cases/remove-member.use-case';
import { FindRoomsByMemberUseCase } from '../../../src/modules/room/domain/use-cases/find-rooms-by-member.use-case';
import { DeleteRoomUseCase } from '../../../src/modules/room/domain/use-cases/delete-room.use-case';
import { Types } from 'mongoose';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

const mockRoomEntity = new RoomEntity(
  'Test Room',
  'Test Description',
  [
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
  ],
  '550e8400-e29b-41d4-a716-446655440003',
  new Types.ObjectId().toString(),
);

const mockCreateRoomUseCase = {
  execute: jest.fn(),
};

const mockFindAllRoomsUseCase = {
  execute: jest.fn(),
};

const mockFindRoomByIdUseCase = {
  execute: jest.fn(),
};

const mockUpdateRoomUseCase = {
  execute: jest.fn(),
};

const mockAddMemberUseCase = {
  execute: jest.fn(),
};

const mockRemoveMemberUseCase = {
  execute: jest.fn(),
};

const mockFindRoomsByMemberUseCase = {
  execute: jest.fn(),
};

const mockDeleteRoomUseCase = {
  execute: jest.fn(),
};

describe('RoomController', () => {
  let controller: RoomController;
  let createRoomUseCase: CreateRoomUseCase;
  let findAllRoomsUseCase: FindAllRoomsUseCase;
  let findRoomByIdUseCase: FindRoomByIdUseCase;
  let updateRoomUseCase: UpdateRoomUseCase;
  let addMemberUseCase: AddMemberUseCase;
  let removeMemberUseCase: RemoveMemberUseCase;
  let findRoomsByMemberUseCase: FindRoomsByMemberUseCase;
  let deleteRoomUseCase: DeleteRoomUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [
        {
          provide: CreateRoomUseCase,
          useValue: mockCreateRoomUseCase,
        },
        {
          provide: FindAllRoomsUseCase,
          useValue: mockFindAllRoomsUseCase,
        },
        {
          provide: FindRoomByIdUseCase,
          useValue: mockFindRoomByIdUseCase,
        },
        {
          provide: UpdateRoomUseCase,
          useValue: mockUpdateRoomUseCase,
        },
        {
          provide: AddMemberUseCase,
          useValue: mockAddMemberUseCase,
        },
        {
          provide: RemoveMemberUseCase,
          useValue: mockRemoveMemberUseCase,
        },
        {
          provide: FindRoomsByMemberUseCase,
          useValue: mockFindRoomsByMemberUseCase,
        },
        {
          provide: DeleteRoomUseCase,
          useValue: mockDeleteRoomUseCase,
        },
      ],
    }).compile();

    controller = module.get<RoomController>(RoomController);
    createRoomUseCase = module.get<CreateRoomUseCase>(CreateRoomUseCase);
    findAllRoomsUseCase = module.get<FindAllRoomsUseCase>(FindAllRoomsUseCase);
    findRoomByIdUseCase = module.get<FindRoomByIdUseCase>(FindRoomByIdUseCase);
    updateRoomUseCase = module.get<UpdateRoomUseCase>(UpdateRoomUseCase);
    addMemberUseCase = module.get<AddMemberUseCase>(AddMemberUseCase);
    removeMemberUseCase = module.get<RemoveMemberUseCase>(RemoveMemberUseCase);
    findRoomsByMemberUseCase = module.get<FindRoomsByMemberUseCase>(
      FindRoomsByMemberUseCase,
    );
    deleteRoomUseCase = module.get<DeleteRoomUseCase>(DeleteRoomUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createRoomDto: CreateRoomDto = {
      name: 'Test Room',
      description: 'Test Description',
      members: [
        '550e8400-e29b-41d4-a716-446655440004',
        '550e8400-e29b-41d4-a716-446655440005',
      ],
      createdBy: '550e8400-e29b-41d4-a716-446655440006',
    };

    it('should create a room', async () => {
      jest
        .spyOn(createRoomUseCase, 'execute')
        .mockResolvedValue(mockRoomEntity);

      const result = await controller.create(createRoomDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', mockRoomEntity.name);
      expect(createRoomUseCase.execute).toHaveBeenCalledWith(createRoomDto);
    });

    it('should handle service errors', async () => {
      jest
        .spyOn(createRoomUseCase, 'execute')
        .mockRejectedValue(new ConflictException('Room already exists'));

      await expect(controller.create(createRoomDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all rooms', async () => {
      const mockRooms = [mockRoomEntity, mockRoomEntity];
      jest.spyOn(findAllRoomsUseCase, 'execute').mockResolvedValue(mockRooms);

      const result = await controller.findAll();

      expect(result).toHaveLength(2);
      expect(findAllRoomsUseCase.execute).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      jest
        .spyOn(findAllRoomsUseCase, 'execute')
        .mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll()).rejects.toThrow();
    });
  });

  describe('findByMember', () => {
    it('should return rooms by member ID', async () => {
      const memberId = '550e8400-e29b-41d4-a716-446655440007';
      const mockRooms = [mockRoomEntity];
      jest
        .spyOn(findRoomsByMemberUseCase, 'execute')
        .mockResolvedValue(mockRooms);

      const result = await controller.findByMember(memberId);

      expect(result).toHaveLength(1);
      expect(findRoomsByMemberUseCase.execute).toHaveBeenCalledWith(memberId);
    });

    it('should handle errors when member has no rooms', async () => {
      const memberId = '550e8400-e29b-41d4-a716-446655440008';
      jest.spyOn(findRoomsByMemberUseCase, 'execute').mockResolvedValue([]);

      const result = await controller.findByMember(memberId);

      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      const memberId = '550e8400-e29b-41d4-a716-446655440009';
      jest
        .spyOn(findRoomsByMemberUseCase, 'execute')
        .mockRejectedValue(new BadRequestException('Invalid user ID'));

      await expect(controller.findByMember(memberId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a room by ID', async () => {
      const roomId = new Types.ObjectId().toString();
      jest
        .spyOn(findRoomByIdUseCase, 'execute')
        .mockResolvedValue(mockRoomEntity);

      const result = await controller.findOne(roomId);

      expect(result).toHaveProperty('id');
      expect(findRoomByIdUseCase.execute).toHaveBeenCalledWith(roomId);
    });

    it('should handle not found error', async () => {
      const roomId = new Types.ObjectId().toString();
      jest
        .spyOn(findRoomByIdUseCase, 'execute')
        .mockRejectedValue(new NotFoundException('Room not found'));

      await expect(controller.findOne(roomId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle bad request error', async () => {
      const roomId = 'invalid-id';
      jest
        .spyOn(findRoomByIdUseCase, 'execute')
        .mockRejectedValue(new BadRequestException('Invalid room ID format'));

      await expect(controller.findOne(roomId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    const updateRoomDto: UpdateRoomDto = {
      name: 'Updated Room Name',
      description: 'Updated Description',
    };

    it('should update a room', async () => {
      const roomId = new Types.ObjectId().toString();
      const updatedEntity = new RoomEntity(
        updateRoomDto.name,
        updateRoomDto.description,
        mockRoomEntity.members,
        mockRoomEntity.createdBy,
        roomId,
      );
      jest.spyOn(updateRoomUseCase, 'execute').mockResolvedValue(updatedEntity);

      const result = await controller.update(roomId, updateRoomDto);

      expect(result).toHaveProperty('name', updateRoomDto.name);
      expect(updateRoomUseCase.execute).toHaveBeenCalledWith(
        roomId,
        updateRoomDto,
      );
    });

    it('should handle update errors - conflict', async () => {
      const roomId = new Types.ObjectId().toString();
      jest
        .spyOn(updateRoomUseCase, 'execute')
        .mockRejectedValue(new ConflictException('Name already exists'));

      await expect(controller.update(roomId, updateRoomDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle update errors - not found', async () => {
      const roomId = new Types.ObjectId().toString();
      jest
        .spyOn(updateRoomUseCase, 'execute')
        .mockRejectedValue(new NotFoundException('Room not found'));

      await expect(controller.update(roomId, updateRoomDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addMember', () => {
    it('should add member to room', async () => {
      const roomId = new Types.ObjectId().toString();
      const userId = '550e8400-e29b-41d4-a716-44665544000a';
      const updatedEntity = new RoomEntity(
        mockRoomEntity.name,
        mockRoomEntity.description,
        [...mockRoomEntity.members, userId],
        mockRoomEntity.createdBy,
        mockRoomEntity.id,
      );
      jest.spyOn(addMemberUseCase, 'execute').mockResolvedValue(updatedEntity);

      const result = await controller.addMember(roomId, userId);

      expect(result.members).toContain(userId);
      expect(addMemberUseCase.execute).toHaveBeenCalledWith(roomId, userId);
    });

    it('should handle add member errors - conflict', async () => {
      const roomId = new Types.ObjectId().toString();
      const userId = '550e8400-e29b-41d4-a716-44665544000b';
      jest
        .spyOn(addMemberUseCase, 'execute')
        .mockRejectedValue(new ConflictException('User already member'));

      await expect(controller.addMember(roomId, userId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle add member errors - not found', async () => {
      const roomId = new Types.ObjectId().toString();
      const userId = '550e8400-e29b-41d4-a716-44665544000c';
      jest
        .spyOn(addMemberUseCase, 'execute')
        .mockRejectedValue(new NotFoundException('Room not found'));

      await expect(controller.addMember(roomId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeMember', () => {
    it('should remove member from room', async () => {
      const roomId = new Types.ObjectId().toString();
      const userId = '550e8400-e29b-41d4-a716-44665544000d';
      const updatedEntity = new RoomEntity(
        mockRoomEntity.name,
        mockRoomEntity.description,
        mockRoomEntity.members.filter((id) => id !== userId),
        mockRoomEntity.createdBy,
        mockRoomEntity.id,
      );
      jest
        .spyOn(removeMemberUseCase, 'execute')
        .mockResolvedValue(updatedEntity);

      const result = await controller.removeMember(roomId, userId);

      expect(result.members).not.toContain(userId);
      expect(removeMemberUseCase.execute).toHaveBeenCalledWith(roomId, userId);
    });

    it('should handle remove member errors - not found', async () => {
      const roomId = new Types.ObjectId().toString();
      const userId = '550e8400-e29b-41d4-a716-44665544000e';
      jest
        .spyOn(removeMemberUseCase, 'execute')
        .mockRejectedValue(new NotFoundException('User not member'));

      await expect(controller.removeMember(roomId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle remove member errors - bad request', async () => {
      const roomId = 'invalid-id';
      const userId = '550e8400-e29b-41d4-a716-44665544000f';
      jest
        .spyOn(removeMemberUseCase, 'execute')
        .mockRejectedValue(new BadRequestException('Invalid room ID'));

      await expect(controller.removeMember(roomId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a room', async () => {
      const roomId = new Types.ObjectId().toString();
      jest.spyOn(deleteRoomUseCase, 'execute').mockResolvedValue(undefined);

      await controller.remove(roomId);

      expect(deleteRoomUseCase.execute).toHaveBeenCalledWith(roomId);
    });

    it('should handle delete errors - not found', async () => {
      const roomId = new Types.ObjectId().toString();
      jest
        .spyOn(deleteRoomUseCase, 'execute')
        .mockRejectedValue(new NotFoundException('Room not found'));

      await expect(controller.remove(roomId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle delete errors - bad request', async () => {
      const roomId = 'invalid-id';
      jest
        .spyOn(deleteRoomUseCase, 'execute')
        .mockRejectedValue(new BadRequestException('Invalid room ID'));

      await expect(controller.remove(roomId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
