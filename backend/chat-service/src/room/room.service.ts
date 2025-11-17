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
      members: room.members,
      createdBy: room.createdBy,
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

  private prepareRoomCreationData(createRoomDto: CreateRoomDto) {
    return {
      name: createRoomDto.name,
      description: createRoomDto.description,
      members: createRoomDto.members,
      createdBy: createRoomDto.createdBy,
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
      const roomData = this.prepareRoomCreationData(createRoomDto);
      const createdRoom = new this.roomModel(roomData);
      const savedRoom = await createdRoom.save();

      return this.toRoomResponseDto(savedRoom);
    } catch (error) {
      return this.validationService.handleServiceError(
        error,
        'Error creating room',
      );
    }
  }

  async findAll(): Promise<RoomResponseDto[]> {
    try {
      const rooms = await this.roomModel.find().sort({ createdAt: -1 }).exec();

      return rooms.map((room) => this.toRoomResponseDto(room));
    } catch (error) {
      return this.validationService.handleServiceError(
        error,
        'Error fetching rooms',
      );
    }
  }

  async findOne(roomId: string): Promise<RoomResponseDto> {
    try {
      const room = await this.findRoomByIdOrThrow(roomId);
      return this.toRoomResponseDto(room);
    } catch (error) {
      return this.validationService.handleServiceError(
        error,
        'Error fetching room',
      );
    }
  }

  async updateRoom(
    roomId: string,
    updateRoomDto: UpdateRoomDto,
  ): Promise<RoomResponseDto> {
    try {
      const room = await this.findRoomByIdOrThrow(roomId);

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
      return this.validationService.handleServiceError(
        error,
        'Error updating room',
      );
    }
  }

  async addMember(roomId: string, userId: string): Promise<RoomResponseDto> {
    try {
      const room = await this.findRoomByIdOrThrow(roomId);

      const isAlreadyMember = room.members.includes(userId);

      if (isAlreadyMember) {
        throw new ConflictException('User is already a member of this room');
      }

      room.members.push(userId);
      const updatedRoom = await room.save();

      return this.toRoomResponseDto(updatedRoom);
    } catch (error) {
      return this.validationService.handleServiceError(
        error,
        'Error adding member to room',
      );
    }
  }

  async findByMember(userId: string): Promise<RoomResponseDto[]> {
    try {
      const rooms = await this.roomModel
        .find({ members: userId })
        .sort({ createdAt: -1 })
        .exec();

      return rooms.map((room) => this.toRoomResponseDto(room));
    } catch (error) {
      return this.validationService.handleServiceError(
        error,
        'Error fetching user rooms',
      );
    }
  }

  async removeMember(roomId: string, userId: string): Promise<RoomResponseDto> {
    try {
      const room = await this.findRoomByIdOrThrow(roomId);

      const initialMemberCount = room.members.length;
      room.members = room.members.filter((member) => member !== userId);

      if (room.members.length === initialMemberCount) {
        throw new NotFoundException('User is not a member of this room');
      }

      const updatedRoom = await room.save();
      return this.toRoomResponseDto(updatedRoom);
    } catch (error) {
      return this.validationService.handleServiceError(
        error,
        'Error removing member from room',
      );
    }
  }
}
