import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from '../../../src/room/room.controller';
import { RoomService } from '../../../src/room/room.service';
import { CreateRoomDto } from '../../../src/room/dto/create-room.dto';
import { UpdateRoomDto } from '../../../src/room/dto/update-room.dto';
import { RoomResponseDto } from '../../../src/room/dto/room-response.dto';
import { Types } from 'mongoose';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

const mockRoomResponse: RoomResponseDto = {
  id: new Types.ObjectId().toString(),
  name: 'Test Room',
  description: 'Test Description',
  members: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
  createdBy: '550e8400-e29b-41d4-a716-446655440003',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRoomService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  updateRoom: jest.fn(),
  addMember: jest.fn(),
  removeMember: jest.fn(),
  findByMember: jest.fn(),
};

describe('RoomController', () => {
  let controller: RoomController;
  let service: RoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
      ],
    }).compile();

    controller = module.get<RoomController>(RoomController);
    service = module.get<RoomService>(RoomService);
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
      jest.spyOn(service, 'create').mockResolvedValue(mockRoomResponse);

      const result = await controller.create(createRoomDto);

      expect(result).toEqual(mockRoomResponse);
      expect(service.create).toHaveBeenCalledWith(createRoomDto);
    });

    it('should handle service errors', async () => {
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new ConflictException('Room already exists'));

      await expect(controller.create(createRoomDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all rooms', async () => {
      const mockRooms = [mockRoomResponse, mockRoomResponse];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockRooms);

      const result = await controller.findAll();

      expect(result).toEqual(mockRooms);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      jest
        .spyOn(service, 'findAll')
        .mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll()).rejects.toThrow();
    });
  });

  describe('findByMember', () => {
    it('should return rooms by member ID', async () => {
      const memberId = '550e8400-e29b-41d4-a716-446655440007';
      const mockRooms = [mockRoomResponse];
      jest.spyOn(service, 'findByMember').mockResolvedValue(mockRooms);

      const result = await controller.findByMember(memberId);

      expect(result).toEqual(mockRooms);
      expect(service.findByMember).toHaveBeenCalledWith(memberId);
    });

    it('should handle errors when member has no rooms', async () => {
      const memberId = '550e8400-e29b-41d4-a716-446655440008';
      jest.spyOn(service, 'findByMember').mockResolvedValue([]);

      const result = await controller.findByMember(memberId);

      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      const memberId = '550e8400-e29b-41d4-a716-446655440009';
      jest
        .spyOn(service, 'findByMember')
        .mockRejectedValue(new BadRequestException('Invalid user ID'));

      await expect(controller.findByMember(memberId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a room by ID', async () => {
      const roomId = new Types.ObjectId().toString();
      jest.spyOn(service, 'findOne').mockResolvedValue(mockRoomResponse);

      const result = await controller.findOne(roomId);

      expect(result).toEqual(mockRoomResponse);
      expect(service.findOne).toHaveBeenCalledWith(roomId);
    });

    it('should handle not found error', async () => {
      const roomId = new Types.ObjectId().toString();
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Room not found'));

      await expect(controller.findOne(roomId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle bad request error', async () => {
      const roomId = 'invalid-id';
      jest
        .spyOn(service, 'findOne')
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
      const updatedRoom = { ...mockRoomResponse, ...updateRoomDto };
      jest.spyOn(service, 'updateRoom').mockResolvedValue(updatedRoom);

      const result = await controller.update(roomId, updateRoomDto);

      expect(result).toEqual(updatedRoom);
      expect(service.updateRoom).toHaveBeenCalledWith(roomId, updateRoomDto);
    });

    it('should handle update errors - conflict', async () => {
      const roomId = new Types.ObjectId().toString();
      jest
        .spyOn(service, 'updateRoom')
        .mockRejectedValue(new ConflictException('Name already exists'));

      await expect(controller.update(roomId, updateRoomDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle update errors - not found', async () => {
      const roomId = new Types.ObjectId().toString();
      jest
        .spyOn(service, 'updateRoom')
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
      const updatedRoom = {
        ...mockRoomResponse,
        members: [...mockRoomResponse.members, userId],
      };
      jest.spyOn(service, 'addMember').mockResolvedValue(updatedRoom);

      const result = await controller.addMember(roomId, userId);

      expect(result).toEqual(updatedRoom);
      expect(service.addMember).toHaveBeenCalledWith(roomId, userId);
    });

    it('should handle add member errors - conflict', async () => {
      const roomId = new Types.ObjectId().toString();
      const userId = '550e8400-e29b-41d4-a716-44665544000b';
      jest
        .spyOn(service, 'addMember')
        .mockRejectedValue(new ConflictException('User already member'));

      await expect(controller.addMember(roomId, userId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle add member errors - not found', async () => {
      const roomId = new Types.ObjectId().toString();
      const userId = '550e8400-e29b-41d4-a716-44665544000c';
      jest
        .spyOn(service, 'addMember')
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
      const updatedRoom = {
        ...mockRoomResponse,
        members: mockRoomResponse.members.filter((id) => id !== userId),
      };
      jest.spyOn(service, 'removeMember').mockResolvedValue(updatedRoom);

      const result = await controller.removeMember(roomId, userId);

      expect(result).toEqual(updatedRoom);
      expect(service.removeMember).toHaveBeenCalledWith(roomId, userId);
    });

    it('should handle remove member errors - not found', async () => {
      const roomId = new Types.ObjectId().toString();
      const userId = '550e8400-e29b-41d4-a716-44665544000e';
      jest
        .spyOn(service, 'removeMember')
        .mockRejectedValue(new NotFoundException('User not member'));

      await expect(controller.removeMember(roomId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle remove member errors - bad request', async () => {
      const roomId = 'invalid-id';
      const userId = '550e8400-e29b-41d4-a716-44665544000f';
      jest
        .spyOn(service, 'removeMember')
        .mockRejectedValue(new BadRequestException('Invalid room ID'));

      await expect(controller.removeMember(roomId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
