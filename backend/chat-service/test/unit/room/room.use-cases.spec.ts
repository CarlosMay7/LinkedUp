import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateRoomUseCase } from '../../../src/modules/room/domain/use-cases/create-room.use-case';
import { FindAllRoomsUseCase } from '../../../src/modules/room/domain/use-cases/find-all-rooms.use-case';
import { FindRoomByIdUseCase } from '../../../src/modules/room/domain/use-cases/find-room-by-id.use-case';
import { FindRoomByNameUseCase } from '../../../src/modules/room/domain/use-cases/find-room-by-name.use-case';
import { UpdateRoomUseCase } from '../../../src/modules/room/domain/use-cases/update-room.use-case';
import { AddMemberUseCase } from '../../../src/modules/room/domain/use-cases/add-member.use-case';
import { RemoveMemberUseCase } from '../../../src/modules/room/domain/use-cases/remove-member.use-case';
import { FindRoomsByMemberUseCase } from '../../../src/modules/room/domain/use-cases/find-rooms-by-member.use-case';
import { DeleteRoomUseCase } from '../../../src/modules/room/domain/use-cases/delete-room.use-case';
import { ROOM_REPOSITORY } from '../../../src/modules/room/domain/interfaces/room.repository';
import { RoomEntity } from '../../../src/modules/room/domain/entities/room.entity';
import { CreateRoomDto } from '../../../src/modules/room/infrastructure/controllers/dto/dto/create-room.dto';
import { UpdateRoomDto } from '../../../src/modules/room/infrastructure/controllers/dto/dto/update-room.dto';
import { ValidationService } from '../../../src/modules/common/validation.service';

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

const mockRoomRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  findByMember: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockValidationService = {
  validateObjectId: jest.fn(),
  validateUUID: jest.fn(),
  handleServiceError: jest.fn((error) => {
    throw error;
  }),
};

describe('Room Use Cases', () => {
  let createRoomUseCase: CreateRoomUseCase;
  let findAllRoomsUseCase: FindAllRoomsUseCase;
  let findRoomByIdUseCase: FindRoomByIdUseCase;
  let findRoomByNameUseCase: FindRoomByNameUseCase;
  let updateRoomUseCase: UpdateRoomUseCase;
  let addMemberUseCase: AddMemberUseCase;
  let removeMemberUseCase: RemoveMemberUseCase;
  let findRoomsByMemberUseCase: FindRoomsByMemberUseCase;
  let deleteRoomUseCase: DeleteRoomUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRoomUseCase,
        FindAllRoomsUseCase,
        FindRoomByIdUseCase,
        UpdateRoomUseCase,
        AddMemberUseCase,
        RemoveMemberUseCase,
        FindRoomsByMemberUseCase,
        DeleteRoomUseCase,
        {
          provide: ROOM_REPOSITORY,
          useValue: mockRoomRepository,
        },
        {
          provide: ValidationService,
          useValue: mockValidationService,
        },
      ],
    }).compile();

    createRoomUseCase = module.get<CreateRoomUseCase>(CreateRoomUseCase);
    findAllRoomsUseCase = module.get<FindAllRoomsUseCase>(FindAllRoomsUseCase);
    findRoomByIdUseCase = module.get<FindRoomByIdUseCase>(FindRoomByIdUseCase);
    findRoomByNameUseCase = module.get<FindRoomByNameUseCase>(FindRoomByNameUseCase);
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

  describe('CreateRoomUseCase', () => {
    const createRoomDto: CreateRoomDto = {
      name: 'New Room',
      description: 'New Description',
      members: [
        '550e8400-e29b-41d4-a716-446655440004',
        '550e8400-e29b-41d4-a716-446655440005',
      ],
      createdBy: '550e8400-e29b-41d4-a716-446655440006',
    };

    it('should create a room successfully', async () => {
      mockRoomRepository.findByName.mockResolvedValue([]);
      mockRoomRepository.create.mockResolvedValue(mockRoomEntity);

      const result = await createRoomUseCase.execute(
        createRoomDto.name,
        createRoomDto.description,
        createRoomDto.members,
        createRoomDto.createdBy,
      );

      expect(mockRoomRepository.findByName).toHaveBeenCalledWith(
        createRoomDto.name,
      );
      expect(mockRoomRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockRoomEntity);
    });

    it('should throw ConflictException if room name already exists', async () => {
      mockRoomRepository.findByName.mockResolvedValue([mockRoomEntity]);

      await expect(
        createRoomUseCase.execute(
          createRoomDto.name,
          createRoomDto.description,
          createRoomDto.members,
          createRoomDto.createdBy,
        ),
      ).rejects.toThrow(ConflictException);
      expect(mockRoomRepository.findByName).toHaveBeenCalledWith(
        createRoomDto.name,
      );
      expect(mockRoomRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('FindAllRoomsUseCase', () => {
    it('should return all rooms', async () => {
      const rooms = [mockRoomEntity, mockRoomEntity];
      mockRoomRepository.findAll.mockResolvedValue(rooms);

      const result = await findAllRoomsUseCase.execute();

      expect(mockRoomRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(rooms);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no rooms exist', async () => {
      mockRoomRepository.findAll.mockResolvedValue([]);

      const result = await findAllRoomsUseCase.execute();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('FindRoomByIdUseCase', () => {
    const roomId = new Types.ObjectId().toString();

    it('should return a room by id', async () => {
      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockRoomRepository.findById.mockResolvedValue(mockRoomEntity);

      const result = await findRoomByIdUseCase.execute(roomId);

      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        roomId,
        'room ID',
      );
      expect(mockRoomRepository.findById).toHaveBeenCalledWith(roomId);
      expect(result).toEqual(mockRoomEntity);
    });

    it('should throw NotFoundException if room not found', async () => {
      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockRoomRepository.findById.mockResolvedValue(null);

      await expect(findRoomByIdUseCase.execute(roomId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRoomRepository.findById).toHaveBeenCalledWith(roomId);
    });

    it('should throw BadRequestException if room id is invalid', async () => {
      mockValidationService.validateObjectId.mockImplementation(() => {
        throw new BadRequestException('Invalid room ID format');
      });

      await expect(findRoomByIdUseCase.execute('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('FindRoomByNameUseCase', () => {
    const roomName = 'Test Room';

    it('should return rooms by name', async () => {
      mockRoomRepository.findByName.mockResolvedValue([mockRoomEntity]);

      const result = await findRoomByNameUseCase.execute(roomName);

      expect(mockRoomRepository.findByName).toHaveBeenCalledWith(roomName);
      expect(result).toEqual([mockRoomEntity]);
      expect(result).toHaveLength(1);
    });

    it('should return empty array if no rooms found', async () => {
      mockRoomRepository.findByName.mockResolvedValue([]);

      const result = await findRoomByNameUseCase.execute(roomName);

      expect(mockRoomRepository.findByName).toHaveBeenCalledWith(roomName);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('UpdateRoomUseCase', () => {
    const roomId = new Types.ObjectId().toString();
    const updateRoomDto: UpdateRoomDto = {
      name: 'Updated Room',
      description: 'Updated Description',
    };

    it('should update room name and description', async () => {
      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockRoomRepository.findById.mockResolvedValue(mockRoomEntity);
      mockRoomRepository.findByName.mockResolvedValue([]);
      mockRoomRepository.save.mockResolvedValue(mockRoomEntity);

      const result = await updateRoomUseCase.execute(
        roomId,
        updateRoomDto.name,
        updateRoomDto.description,
      );

      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        roomId,
        'room ID',
      );
      expect(mockRoomRepository.findById).toHaveBeenCalledWith(roomId);
      expect(mockRoomRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockRoomEntity);
    });

    it('should throw NotFoundException if room not found', async () => {
      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockRoomRepository.findById.mockResolvedValue(null);

      await expect(
        updateRoomUseCase.execute(
          roomId,
          updateRoomDto.name,
          updateRoomDto.description,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(mockRoomRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if new name already exists', async () => {
      const existingRoom = new RoomEntity(
        'Updated Room',
        'Other Description',
        [],
        '550e8400-e29b-41d4-a716-446655440007',
        new Types.ObjectId().toString(), // Different ID
      );
      const roomToUpdate = new RoomEntity(
        'Old Name', // Different name
        'Old Description',
        ['550e8400-e29b-41d4-a716-446655440001'],
        '550e8400-e29b-41d4-a716-446655440003',
        roomId,
      );
      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockRoomRepository.findById.mockResolvedValue(roomToUpdate);
      mockRoomRepository.findByName.mockResolvedValue([existingRoom]);

      await expect(
        updateRoomUseCase.execute(
          roomId,
          updateRoomDto.name,
          updateRoomDto.description,
        ),
      ).rejects.toThrow(ConflictException);
      expect(mockRoomRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if no fields provided', async () => {
      mockValidationService.validateObjectId.mockReturnValue(undefined);

      await expect(
        updateRoomUseCase.execute(roomId, undefined, undefined),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('AddMemberUseCase', () => {
    const roomId = new Types.ObjectId().toString();
    const userId = '550e8400-e29b-41d4-a716-44665544000a';

    it('should add member to room', async () => {
      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockValidationService.validateUUID.mockReturnValue(undefined);
      mockRoomRepository.findById.mockResolvedValue(mockRoomEntity);
      mockRoomRepository.save.mockResolvedValue(mockRoomEntity);

      const result = await addMemberUseCase.execute(roomId, userId);

      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        roomId,
        'room ID',
      );
      expect(mockValidationService.validateUUID).toHaveBeenCalledWith(
        userId,
        'user ID',
      );
      expect(mockRoomRepository.findById).toHaveBeenCalledWith(roomId);
      expect(mockRoomRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockRoomEntity);
    });

    it('should throw NotFoundException if room not found', async () => {
      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockValidationService.validateUUID.mockReturnValue(undefined);
      mockRoomRepository.findById.mockResolvedValue(null);

      await expect(addMemberUseCase.execute(roomId, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRoomRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if user is already a member', async () => {
      const existingMemberId = '550e8400-e29b-41d4-a716-446655440001';
      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockValidationService.validateUUID.mockReturnValue(undefined);
      mockRoomRepository.findById.mockResolvedValue(mockRoomEntity);

      await expect(
        addMemberUseCase.execute(roomId, existingMemberId),
      ).rejects.toThrow(ConflictException);
      expect(mockRoomRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('RemoveMemberUseCase', () => {
    const roomId = new Types.ObjectId().toString();
    const userId = '550e8400-e29b-41d4-a716-446655440001';

    it('should remove member from room', async () => {
      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockValidationService.validateUUID.mockReturnValue(undefined);
      mockRoomRepository.findById.mockResolvedValue(mockRoomEntity);
      mockRoomRepository.save.mockResolvedValue(mockRoomEntity);

      const result = await removeMemberUseCase.execute(roomId, userId);

      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        roomId,
        'room ID',
      );
      expect(mockValidationService.validateUUID).toHaveBeenCalledWith(
        userId,
        'user ID',
      );
      expect(mockRoomRepository.findById).toHaveBeenCalledWith(roomId);
      expect(mockRoomRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockRoomEntity);
    });

    it('should throw NotFoundException if room not found', async () => {
      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockValidationService.validateUUID.mockReturnValue(undefined);
      mockRoomRepository.findById.mockResolvedValue(null);

      await expect(removeMemberUseCase.execute(roomId, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRoomRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user is not a member', async () => {
      const nonMemberId = '550e8400-e29b-41d4-a716-44665544000b';
      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockValidationService.validateUUID.mockReturnValue(undefined);
      mockRoomRepository.findById.mockResolvedValue(mockRoomEntity);

      await expect(
        removeMemberUseCase.execute(roomId, nonMemberId),
      ).rejects.toThrow(NotFoundException);
      expect(mockRoomRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('FindRoomsByMemberUseCase', () => {
    const memberId = '550e8400-e29b-41d4-a716-446655440001';

    it('should return rooms by member id', async () => {
      const rooms = [mockRoomEntity];
      mockValidationService.validateUUID.mockReturnValue(undefined);
      mockRoomRepository.findByMember.mockResolvedValue(rooms);

      const result = await findRoomsByMemberUseCase.execute(memberId);

      expect(mockValidationService.validateUUID).toHaveBeenCalledWith(
        memberId,
        'user ID',
      );
      expect(mockRoomRepository.findByMember).toHaveBeenCalledWith(memberId);
      expect(result).toEqual(rooms);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when member has no rooms', async () => {
      mockValidationService.validateUUID.mockReturnValue(undefined);
      mockRoomRepository.findByMember.mockResolvedValue([]);

      const result = await findRoomsByMemberUseCase.execute(memberId);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw BadRequestException if member id is invalid', async () => {
      mockValidationService.validateUUID.mockImplementation(() => {
        throw new BadRequestException('Invalid member ID format');
      });

      await expect(
        findRoomsByMemberUseCase.execute('invalid-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('DeleteRoomUseCase', () => {
    const roomId = new Types.ObjectId().toString();

    it('should delete a room successfully', async () => {
      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockRoomRepository.findById.mockResolvedValue(mockRoomEntity);
      mockRoomRepository.delete.mockResolvedValue(true);

      await deleteRoomUseCase.execute(roomId);

      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        roomId,
        'room ID',
      );
      expect(mockRoomRepository.findById).toHaveBeenCalledWith(roomId);
      expect(mockRoomRepository.delete).toHaveBeenCalledWith(roomId);
    });

    it('should throw NotFoundException if room does not exist', async () => {
      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockRoomRepository.findById.mockResolvedValue(null);

      await expect(deleteRoomUseCase.execute(roomId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRoomRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if room id is invalid', async () => {
      mockValidationService.validateObjectId.mockImplementation(() => {
        throw new BadRequestException('Invalid room ID format');
      });

      await expect(deleteRoomUseCase.execute('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRoomRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw Error if delete operation fails', async () => {
      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockRoomRepository.findById.mockResolvedValue(mockRoomEntity);
      mockRoomRepository.delete.mockResolvedValue(false);

      await expect(deleteRoomUseCase.execute(roomId)).rejects.toThrow(
        'Failed to delete room',
      );
    });
  });
});
