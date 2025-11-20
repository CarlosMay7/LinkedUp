import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
  Inject,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { validate as isValidUUID } from 'uuid';
import {
  IRoomRepository,
  ROOM_REPOSITORY,
} from '../room/domain/interfaces/room.repository';

@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  validateObjectId(id: string, entity: string = 'ID'): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${entity} format`);
    }
  }

  validateUUID(id: string, entity: string = 'ID'): void {
    if (!isValidUUID(id)) {
      throw new BadRequestException(
        `Invalid ${entity} format: must be a valid UUID`,
      );
    }
  }

  async validateRoomExists(roomId: string): Promise<void> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }
  }

  handleServiceError(error: any, defaultMessage: string): never {
    // Re-throw known user-facing exceptions
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException ||
      error instanceof ConflictException
    ) {
      throw error;
    }

    // Handle MongoDB duplicate key error
    if (error && error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];
      const value = error.keyValue?.[field];
      const message = field
        ? `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`
        : 'Resource already exists';
      this.logger.warn(
        `Duplicate key error: ${JSON.stringify(error.keyValue || {})}`,
      );
      throw new ConflictException(message);
    }

    // Handle Mongoose validation errors
    if (error && error.name === 'ValidationError') {
      this.logger.warn(`Validation error: ${error.message}`);
      throw new BadRequestException(error.message);
    }

    // Log unexpected errors with full context before throwing
    this.logger.error(
      `${defaultMessage}: ${error?.message || 'Unknown error'}`,
      error?.stack,
    );
    throw new InternalServerErrorException(defaultMessage);
  }
}
