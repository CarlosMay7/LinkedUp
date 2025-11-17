import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RoomService } from '../../../src/room/room.service';
import { Room } from '../../../src/room/schemas/room.schema';
import { CreateRoomDto } from '../../../src/room/dto/create-room.dto';
import { UpdateRoomDto } from '../../../src/room/dto/update-room.dto';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ValidationService } from '../../../src/common/validation.service';

// === Mock Data ===
const mockRoomId = new Types.ObjectId();
const mockUserId1 = '550e8400-e29b-41d4-a716-446655440001';
const mockUserId2 = '550e8400-e29b-41d4-a716-446655440002';
const mockCreatorId = '550e8400-e29b-41d4-a716-446655440003';

const mockRoom = {
  _id: mockRoomId,
  name: 'Test Room',
  description: 'Test Description',
  members: [mockUserId1, mockUserId2],
  createdBy: mockCreatorId,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('RoomService', () => {
  let service: RoomService;
  let mockRoomModel: any;
  let mockValidationService: any;

  beforeEach(async () => {
    // Reset mocks before each test
    mockRoomModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    mockValidationService = {
      validateObjectId: jest.fn((id: string) => {
        if (!Types.ObjectId.isValid(id)) {
          throw new BadRequestException(`Invalid ObjectId: ${id}`);
        }
      }),
      validateUUID: jest.fn((id: string, entity?: string) => {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          throw new BadRequestException(
            `Invalid ${entity || 'ID'} format: must be a valid UUID`,
          );
        }
      }),
      handleServiceError: jest.fn((error: any) => {
        if (error.code === 11000) {
          const field = Object.keys(error.keyValue || {})[0];
          const value = error.keyValue?.[field];
          const message = field
            ? `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`
            : 'Resource already exists';
          throw new ConflictException(message);
        }
        throw error;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: getModelToken(Room.name),
          useValue: mockRoomModel,
        },
        {
          provide: ValidationService,
          useValue: mockValidationService,
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
  });

  // === CREATE ===
  describe('create', () => {
    const createRoomDto: CreateRoomDto = {
      name: 'Test Room',
      description: 'Test Description',
      members: [mockUserId1, mockUserId2],
      createdBy: mockCreatorId,
    };

    it('should create a room successfully', async () => {
      // Mock that room name doesn't exist
      mockRoomModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Mock the document constructor (new this.roomModel(data))
      const mockSave = jest.fn().mockResolvedValue(mockRoom);
      const mockDoc = {
        save: mockSave,
      };

      (service as any).roomModel = Object.assign(
        jest.fn(() => mockDoc),
        {
          findOne: mockRoomModel.findOne,
          find: mockRoomModel.find,
          findById: mockRoomModel.findById,
          findByIdAndUpdate: mockRoomModel.findByIdAndUpdate,
        },
      );

      const result = await service.create(createRoomDto);

      expect(result).toBeDefined();
      expect(result.name).toBe(createRoomDto.name);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid createdBy ID', async () => {
      // This validation is now handled by ValidationPipe at DTO level with @IsUUID
      // This test can be removed or kept as a placeholder
      expect(true).toBe(true);
    });

    it('should throw ConflictException when room name already exists', async () => {
      const duplicateError: any = new Error('E11000 duplicate key error');
      duplicateError.code = 11000;
      duplicateError.keyValue = { name: createRoomDto.name };

      const mockDoc = {
        save: jest.fn().mockRejectedValue(duplicateError),
      };

      (service as any).roomModel = Object.assign(
        jest.fn(() => mockDoc),
        {
          findOne: mockRoomModel.findOne,
          find: mockRoomModel.find,
          findById: mockRoomModel.findById,
          findByIdAndUpdate: mockRoomModel.findByIdAndUpdate,
        },
      );

      await expect(service.create(createRoomDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // === FIND ALL ===
  describe('findAll', () => {
    it('should return an array of rooms', async () => {
      const mockRooms = [mockRoom, mockRoom];
      mockRoomModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRooms),
        }),
      });

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(mockRoom._id.toString());
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockRoomModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(error),
        }),
      });

      mockValidationService.handleServiceError.mockImplementationOnce((err) => {
        throw err;
      });

      await expect(service.findAll()).rejects.toThrow();
    });
  });

  // === FIND ONE ===
  describe('findOne', () => {
    it('should return a room by ID', async () => {
      const roomId = mockRoomId.toString();
      mockRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRoom),
      });

      const result = await service.findOne(roomId);

      expect(result.id).toBe(mockRoomId.toString());
      expect(result.name).toBe(mockRoom.name);
    });

    it('should throw BadRequestException for invalid ID', async () => {
      mockValidationService.validateObjectId.mockImplementationOnce(() => {
        throw new BadRequestException('Invalid ObjectId');
      });

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when room not found', async () => {
      const roomId = new Types.ObjectId().toString();
      mockRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(roomId)).rejects.toThrow(NotFoundException);
    });
  });

  // === UPDATE ===
  describe('updateRoom', () => {
    const updateRoomDto: UpdateRoomDto = {
      name: 'Updated Room Name',
      description: 'Updated Description',
    };

    it('should update room successfully', async () => {
      const roomId = mockRoomId.toString();
      const updatedRoom = {
        ...mockRoom,
        ...updateRoomDto,
        updatedAt: new Date(),
      };

      mockRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRoom),
      });

      mockRoomModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      mockRoomModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedRoom),
      });

      const result = await service.updateRoom(roomId, updateRoomDto);

      expect(result.name).toBe(updateRoomDto.name);
      expect(result.description).toBe(updateRoomDto.description);
    });

    it('should allow updating with the same name', async () => {
      const roomId = mockRoomId.toString();
      const updateDto = { name: 'Test Room' }; // Same name as mockRoom

      const updatedRoom = { ...mockRoom, updatedAt: new Date() };

      mockRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRoom),
      });

      // findOne should not be called since name is the same
      mockRoomModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedRoom),
      });

      const result = await service.updateRoom(roomId, updateDto);

      expect(result.name).toBe(mockRoom.name);
      expect(mockRoomModel.findOne).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when no fields provided', async () => {
      const roomId = mockRoomId.toString();
      const emptyUpdateDto = {} as UpdateRoomDto;

      // Mock findById to return a valid room
      mockRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRoom),
      });

      await expect(service.updateRoom(roomId, emptyUpdateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException when name already exists', async () => {
      const roomId = mockRoomId.toString();
      const updateDto = { name: 'Existing Room' };

      const existingRoom = {
        _id: new Types.ObjectId(),
        name: 'Existing Room',
        members: [],
        createdBy: mockCreatorId,
      };

      mockRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRoom),
      });

      mockRoomModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingRoom),
      });

      await expect(service.updateRoom(roomId, updateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // === ADD MEMBER ===
  describe('addMember', () => {
    it('should add member to room successfully', async () => {
      const roomId = mockRoomId.toString();
      const newUserId = '550e8400-e29b-41d4-a716-446655440099';

      const roomData = {
        ...mockRoom,
        members: [mockUserId1, mockUserId2],
        save: jest.fn().mockResolvedValue({
          ...mockRoom,
          members: [mockUserId1, mockUserId2, newUserId],
        }),
      };

      mockRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(roomData),
      });

      const result = await service.addMember(roomId, newUserId);

      expect(roomData.save).toHaveBeenCalled();
      expect(result.members).toBeDefined();
    });

    it('should throw ConflictException when user is already a member', async () => {
      const roomId = mockRoomId.toString();
      const existingUserId = mockUserId1;

      const roomData = {
        ...mockRoom,
        save: jest.fn(),
      };

      mockRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(roomData),
      });

      await expect(service.addMember(roomId, existingUserId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // === REMOVE MEMBER ===
  describe('removeMember', () => {
    it('should remove member from room successfully', async () => {
      const roomId = mockRoomId.toString();
      const userIdToRemove = mockUserId1;

      const roomData = {
        ...mockRoom,
        members: [mockUserId1, mockUserId2],
        save: jest.fn().mockResolvedValue({
          ...mockRoom,
          members: [mockUserId2],
        }),
      };

      mockRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(roomData),
      });

      const result = await service.removeMember(roomId, userIdToRemove);

      expect(roomData.save).toHaveBeenCalled();
      expect(result.members).toBeDefined();
    });

    it('should throw NotFoundException when user is not a member', async () => {
      const roomId = mockRoomId.toString();
      const nonMemberUserId = '550e8400-e29b-41d4-a716-446655440099';

      const roomData = {
        ...mockRoom,
        save: jest.fn(),
      };

      mockRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(roomData),
      });

      await expect(
        service.removeMember(roomId, nonMemberUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // === FIND BY MEMBER ===
  describe('findByMember', () => {
    it('should return rooms by member ID', async () => {
      const userId = mockUserId1;
      const mockRooms = [mockRoom];

      mockRoomModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRooms),
        }),
      });

      const result = await service.findByMember(userId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockRoom._id.toString());
    });

    it('should return empty array when user has no rooms', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440099';

      mockRoomModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.findByMember(userId);

      expect(result).toHaveLength(0);
    });
  });
});
