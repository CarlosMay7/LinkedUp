import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Room, RoomDocument } from './schemas/room.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { ValidationService } from '../common/validation.service';
import { RoomNameAvailabilityQuery } from './interfaces/room-query.interface';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    private validationService: ValidationService,
  ) {}

  // === PRIVATE HELPER METHODS ===

  private toRoomResponseDto(room: RoomDocument): RoomResponseDto {
    return {
      id: room._id.toString(),
      name: room.name,
      description: room.description,
      members: room.members.map((member) => member.toString()),
      createdBy: room.createdBy.toString(),
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }
  private async findRoomByIdOrThrow(roomId: string): Promise<RoomDocument> {
    const objectId = this.validateAndConvertIdToObjectId(roomId, 'room ID');

    const room = await this.roomModel.findById(objectId).exec();
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }
    return room;
  }

  private validateAndConvertIdToObjectId(
    id: string,
    entity: string = 'ID',
  ): Types.ObjectId {
    this.validationService.validateObjectId(id, entity);
    return new Types.ObjectId(id);
  }

  private async checkRoomNameAvailability(
    name: string,
    excludeRoomId?: string,
  ): Promise<void> {
    const query: RoomNameAvailabilityQuery = { name };
    if (excludeRoomId) {
      query._id = { $ne: new Types.ObjectId(excludeRoomId) };
    }

    const existingRoom = await this.roomModel.findOne(query).exec();
    if (existingRoom) {
      throw new ConflictException('Room with this name already exists');
    }
  }
  private prepareRoomCreationData(createRoomDto: CreateRoomDto) {
    const membersObjectIds = this.validationService.validateObjectIds(
      createRoomDto.members,
      'member ID',
    );
    this.validationService.validateObjectId(
      createRoomDto.createdBy,
      'creator user ID',
    );

    return {
      name: createRoomDto.name,
      description: createRoomDto.description,
      members: membersObjectIds,
      createdBy: new Types.ObjectId(createRoomDto.createdBy),
    };
  }

  private prepareRoomUpdateData(updateRoomDto: UpdateRoomDto): UpdateRoomDto {
    const allowedFields = ['name', 'description'];
    const immutableFields = ['members', 'createdBy'];
    const providedFields = Object.keys(updateRoomDto).filter(
      (key) => updateRoomDto[key] !== undefined,
    );

    // Check for immutable fields that should never be updated
    const attemptedImmutableFields = providedFields.filter((field) =>
      immutableFields.includes(field),
    );
    if (attemptedImmutableFields.length > 0) {
      throw new BadRequestException(
        `Cannot update immutable fields: ${attemptedImmutableFields.join(', ')}. Use dedicated endpoints to manage members.`,
      );
    }

    // Check for invalid fields
    const invalidFields = providedFields.filter(
      (field) => !allowedFields.includes(field),
    );
    if (invalidFields.length > 0) {
      throw new BadRequestException(
        `Invalid fields: ${invalidFields.join(', ')}. Allowed fields are: ${allowedFields.join(', ')}`,
      );
    }

    // Ensure at least one allowed field is provided
    const hasAllowedField = providedFields.some((field) =>
      allowedFields.includes(field),
    );
    if (!hasAllowedField) {
      throw new BadRequestException(
        'At least one field (name or description) must be provided',
      );
    }

    const updateData: UpdateRoomDto = {};

    if (updateRoomDto.name !== undefined) updateData.name = updateRoomDto.name;
    if (updateRoomDto.description !== undefined)
      updateData.description = updateRoomDto.description;

    return updateData;
  }

  // === PUBLIC API METHODS ===

  async create(createRoomDto: CreateRoomDto): Promise<RoomResponseDto> {
    try {
      await this.checkRoomNameAvailability(createRoomDto.name);

      const roomData = this.prepareRoomCreationData(createRoomDto);
      const createdRoom = new this.roomModel(roomData);
      const savedRoom = await createdRoom.save();

      return this.toRoomResponseDto(savedRoom);
    } catch (error) {
      this.validationService.handleServiceError(error, 'Error creating room');
    }
  }

  async findAll(): Promise<RoomResponseDto[]> {
    try {
      const rooms = await this.roomModel.find().sort({ createdAt: -1 }).exec();

      return rooms.map((room) => this.toRoomResponseDto(room));
    } catch (error) {
      this.validationService.handleServiceError(error, 'Error fetching rooms');
    }
  }

  async findOne(roomId: string): Promise<RoomResponseDto> {
    try {
      const room = await this.findRoomByIdOrThrow(roomId);
      return this.toRoomResponseDto(room);
    } catch (error) {
      this.validationService.handleServiceError(error, 'Error fetching room');
    }
  }

  async updateRoom(
    roomId: string,
    updateRoomDto: UpdateRoomDto,
  ): Promise<RoomResponseDto> {
    try {
      const room = await this.findRoomByIdOrThrow(roomId);

      if (updateRoomDto.name && updateRoomDto.name !== room.name) {
        await this.checkRoomNameAvailability(updateRoomDto.name, roomId);
      }

      const updateData = this.prepareRoomUpdateData(updateRoomDto);
      const updatedRoom = await this.roomModel
        .findByIdAndUpdate(room._id, updateData, {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!updatedRoom)
        throw new NotFoundException(
          `Room with ID ${roomId} not found for update`,
        );

      return this.toRoomResponseDto(updatedRoom);
    } catch (error) {
      this.validationService.handleServiceError(error, 'Error updating room');
    }
  }

  async addMember(roomId: string, userId: string): Promise<RoomResponseDto> {
    try {
      const room = await this.findRoomByIdOrThrow(roomId);
      const userObjectId = this.validateAndConvertIdToObjectId(userId);

      const isAlreadyMember = room.members.some((member) =>
        member.equals(userObjectId),
      );

      if (isAlreadyMember) {
        throw new ConflictException('User is already a member of this room');
      }

      room.members.push(userObjectId);
      const updatedRoom = await room.save();

      return this.toRoomResponseDto(updatedRoom);
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Error adding member to room',
      );
    }
  }

  async findByMember(userId: string): Promise<RoomResponseDto[]> {
    try {
      this.validationService.validateObjectId(userId, 'user ID');

      const rooms = await this.roomModel
        .find({ members: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .exec();

      return rooms.map((room) => this.toRoomResponseDto(room));
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Error fetching user rooms',
      );
    }
  }

  async removeMember(roomId: string, userId: string): Promise<RoomResponseDto> {
    try {
      const room = await this.findRoomByIdOrThrow(roomId);
      const userObjectId = this.validateAndConvertIdToObjectId(userId);

      const initialMemberCount = room.members.length;
      room.members = room.members.filter(
        (member) => !member.equals(userObjectId),
      );

      if (room.members.length === initialMemberCount) {
        throw new NotFoundException('User is not a member of this room');
      }

      const updatedRoom = await room.save();
      return this.toRoomResponseDto(updatedRoom);
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Error removing member from room',
      );
    }
  }
}
