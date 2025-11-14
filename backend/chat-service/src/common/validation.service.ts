import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ValidationService {
  validateObjectId(id: string, entity: string = 'ID'): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${entity} format`);
    }
  }

  validateObjectIds(ids: string[], entity: string = 'ID'): Types.ObjectId[] {
    return ids.map((id) => {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ${entity}: ${id}`);
      }
      return new Types.ObjectId(id);
    });
  }

  handleServiceError(error: any, defaultMessage: string): never {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException ||
      error instanceof ConflictException
    ) {
      throw error;
    }

    if (error && error.code === 11000) {
      throw new ConflictException('Resource already exists');
    }

    if (error && error.name === 'ValidationError') {
      throw new BadRequestException(error.message);
    }

    throw new InternalServerErrorException(defaultMessage);
  }
}
