import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

class UpdateMessageBaseDto {
  @ApiPropertyOptional({
    description: 'Text content of the message',
    example: 'Updated message content',
  })
  @IsOptional()
  @IsNotEmpty({ message: 'content cannot be empty' })
  @IsString({ message: 'content must be a string' })
  content?: string;
}

export class UpdateMessageDto extends PartialType(UpdateMessageBaseDto) {}
