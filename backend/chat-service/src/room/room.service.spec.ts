import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RoomService } from './room.service';
import { Room, RoomDocument } from './schemas/room.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { 
  BadRequestException, 
  ConflictException, 
  NotFoundException, 
} from '@nestjs/common';

// === Mock Data ===
const mockRoomId = new Types.ObjectId();
const mockUserId1 = new Types.ObjectId();
const mockUserId2 = new Types.ObjectId();
const mockCreatorId = new Types.ObjectId();

const mockRoom = {
  _id: mockRoomId,
  name: 'Test Room',
  description: 'Test Description',
  members: [mockUserId1, mockUserId2],
  createdBy: mockCreatorId,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// === Mock Model Base ===
const mockRoomModel = {
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

describe('RoomService', () => {
  let service: RoomService;
  let model: Model<RoomDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: getModelToken(Room.name),
          useValue: mockRoomModel,
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    model = module.get<Model<RoomDocument>>(getModelToken(Room.name));

    jest.clearAllMocks();
  });

  // === CREATE ===
  describe('create', () => {
    const createRoomDto: CreateRoomDto = {
      name: 'Test Room',
      description: 'Test Description',
      members: [mockUserId1.toString(), mockUserId2.toString()],
      createdBy: mockCreatorId.toString(),
    };

    it('should create a room successfully', async () => {
      mockRoomModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const mockSave = jest.fn().mockResolvedValue(mockRoom);

      class MockRoomClass {
        constructor(private data: any) {}
        save = mockSave;
        _id = mockRoomId;
        name = this.data.name;
        description = this.data.description;
        members = this.data.members;
        createdBy = this.data.createdBy;
        createdAt = new Date();
        updatedAt = new Date();
      }

      (MockRoomClass as any).findOne = mockRoomModel.findOne;

      (service as any).roomModel = MockRoomClass;

      const result = await service.create(createRoomDto);

      expect(result.id).toBe(mockRoomId.toString());
      expect(result.name).toBe(createRoomDto.name);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid member ID', async () => {
      const invalidDto = {
        name: 'Unique Room Name 1',
        description: 'Test Description',
        members: ['invalid-id'],
        createdBy: mockCreatorId.toString(),
      };

      mockRoomModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid createdBy ID', async () => {
      const invalidDto = {
        name: 'Unique Room Name 2',
        description: 'Test Description',
        members: [mockUserId1.toString(), mockUserId2.toString()],
        createdBy: 'invalid-id',
      };

      mockRoomModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when room name already exists', async () => {
      mockRoomModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRoom),
      });

      await expect(service.create(createRoomDto)).rejects.toThrow(ConflictException);
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
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(BadRequestException);
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
        updatedAt: new Date()
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
      
      expect(mockRoomModel.findByIdAndUpdate).toHaveBeenCalledWith(
        new Types.ObjectId(roomId),
        expect.objectContaining(updateRoomDto),
        { new: true, runValidators: true }
      );
    });

    it('should throw BadRequestException when no fields provided', async () => {
      const roomId = mockRoomId.toString();
      const emptyUpdateDto = {};

      await expect(service.updateRoom(roomId, emptyUpdateDto)).rejects.toThrow(BadRequestException);
    });
  });

  // === ADD MEMBER ===
  describe('addMember', () => {
    it('should add member to room successfully', async () => {
      const roomId = mockRoomId.toString();
      const newUserId = new Types.ObjectId().toString();
      
      const roomWithoutNewUser = {
        ...mockRoom,
        members: [mockUserId1, mockUserId2],
        save: jest.fn().mockResolvedValue({
          ...mockRoom,
          members: [...mockRoom.members, new Types.ObjectId(newUserId)],
        }),
      };

      mockRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(roomWithoutNewUser),
      });

      const result = await service.addMember(roomId, newUserId);

      expect(roomWithoutNewUser.save).toHaveBeenCalled();
      expect(result.members).toBeDefined();
    });

    it('should throw ConflictException when user is already a member', async () => {
      const roomId = mockRoomId.toString();
      const existingUserId = mockUserId1.toString();

      mockRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRoom),
      });

      await expect(service.addMember(roomId, existingUserId)).rejects.toThrow(ConflictException);
    });
  });

  // === REMOVE MEMBER ===
  describe('removeMember', () => {
    it('should remove member from room successfully', async () => {
      const roomId = mockRoomId.toString();
      const userIdToRemove = mockUserId1.toString();
      
      const roomWithMember = {
        ...mockRoom,
        members: [mockUserId1, mockUserId2],
        save: jest.fn().mockResolvedValue({
          ...mockRoom,
          members: [mockUserId2],
        }),
      };

      mockRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(roomWithMember),
      });

      const result = await service.removeMember(roomId, userIdToRemove);

      expect(roomWithMember.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user is not a member', async () => {
      const roomId = mockRoomId.toString();
      const nonMemberUserId = new Types.ObjectId().toString();

      mockRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRoom),
      });

      await expect(service.removeMember(roomId, nonMemberUserId)).rejects.toThrow(NotFoundException);
    });
  });

  // === FIND BY MEMBER ===
  describe('findByMember', () => {
    it('should return rooms by member ID', async () => {
      const userId = mockUserId1.toString();
      const mockRooms = [mockRoom];

      mockRoomModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRooms),
        }),
      });

      const result = await service.findByMember(userId);

      expect(result).toHaveLength(1);
    });

    it('should throw BadRequestException for invalid user ID', async () => {
      await expect(service.findByMember('invalid-id')).rejects.toThrow(BadRequestException);
    });
  });
});
