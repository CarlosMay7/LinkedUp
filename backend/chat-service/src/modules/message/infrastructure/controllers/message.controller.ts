import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateMessageUseCase } from '../../domain/use-cases/create-message.use-case';
import { FindAllMessagesUseCase } from '../../domain/use-cases/find-all-messages.use-case';
import { FindMessageByIdUseCase } from '../../domain/use-cases/find-message-by-id.use-case';
import { FindMessagesByUsersUseCase } from '../../domain/use-cases/find-messages-by-users.use-case';
import { FindConversationUseCase } from '../../domain/use-cases/find-conversation.use-case';
import { FindMessagesByRoomUseCase } from '../../domain/use-cases/find-messages-by-room.use-case';
import { UpdateMessageUseCase } from '../../domain/use-cases/update-message.use-case';
import { DeleteMessageUseCase } from '../../domain/use-cases/delete-message.use-case';
import { DeleteMessagesByRoomUseCase } from '../../domain/use-cases/delete-messages-by-room.use-case';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { MessageMapper } from '../mappers/message.mapper';

@ApiTags('messages')
@Controller('messages')
export class MessageController {
  constructor(
    private readonly createMessageUseCase: CreateMessageUseCase,
    private readonly findAllMessagesUseCase: FindAllMessagesUseCase,
    private readonly findMessageByIdUseCase: FindMessageByIdUseCase,
    private readonly findMessagesByUsersUseCase: FindMessagesByUsersUseCase,
    private readonly findConversationUseCase: FindConversationUseCase,
    private readonly findMessagesByRoomUseCase: FindMessagesByRoomUseCase,
    private readonly updateMessageUseCase: UpdateMessageUseCase,
    private readonly deleteMessageUseCase: DeleteMessageUseCase,
    private readonly deleteMessagesByRoomUseCase: DeleteMessagesByRoomUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Message created successfully',
    type: MessageResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation error',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or validation error',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async create(
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.createMessageUseCase.execute(
      createMessageDto.roomId,
      createMessageDto.senderId,
      createMessageDto.receiverId,
      createMessageDto.content,
    );
    return MessageMapper.toDto(message);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all messages' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all messages',
    type: [MessageResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findAll(): Promise<MessageResponseDto[]> {
    const messages = await this.findAllMessagesUseCase.execute();
    return MessageMapper.toDtoArray(messages);
  }

  @Get('users/filter')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get messages filtered by sender and/or receiver',
  })
  @ApiQuery({
    name: 'senderId',
    required: false,
    description: 'Filter by sender ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiQuery({
    name: 'receiverId',
    required: false,
    description: 'Filter by receiver ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Filtered messages',
    type: [MessageResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Invalid user IDs format',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid user IDs format',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findByUsers(
    @Query('senderId') senderId?: string,
    @Query('receiverId') receiverId?: string,
  ): Promise<MessageResponseDto[]> {
    const messages = await this.findMessagesByUsersUseCase.execute(
      senderId,
      receiverId,
    );
    return MessageMapper.toDtoArray(messages);
  }

  @Get('conversation/:userId1/:userId2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get private conversation between two users',
  })
  @ApiParam({
    name: 'userId1',
    description: 'First user ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiParam({
    name: 'userId2',
    description: 'Second user ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Private conversation messages',
    type: [MessageResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Invalid user IDs format',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid user IDs format',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findConversation(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
  ): Promise<MessageResponseDto[]> {
    const messages = await this.findConversationUseCase.execute(
      userId1,
      userId2,
    );
    return MessageMapper.toDtoArray(messages);
  }

  @Get('room/:roomId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all messages in a room' })
  @ApiParam({
    name: 'roomId',
    description: 'Room ID',
    example: '67409b2f88a7c7eae01c4e91',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of room messages',
    type: [MessageResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Invalid room ID format',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid room ID format',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findByRoom(
    @Param('roomId') roomId: string,
  ): Promise<MessageResponseDto[]> {
    const messages = await this.findMessagesByRoomUseCase.execute(roomId);
    return MessageMapper.toDtoArray(messages);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a message by ID' })
  @ApiParam({
    name: 'id',
    description: 'Message ID',
    example: '67409b2f88a7c7eae01c4e91',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message found',
    type: MessageResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid message ID format',
  })
  @ApiNotFoundResponse({
    description: 'Message not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid message ID format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Message not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findOne(@Param('id') id: string): Promise<MessageResponseDto> {
    const message = await this.findMessageByIdUseCase.execute(id);
    return MessageMapper.toDto(message);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a message' })
  @ApiParam({
    name: 'id',
    description: 'Message ID',
    example: '67409b2f88a7c7eae01c4e91',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message updated successfully',
    type: MessageResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid message ID format or invalid input data',
  })
  @ApiNotFoundResponse({
    description: 'Message not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid message ID format or invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Message not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.updateMessageUseCase.execute(
      id,
      updateMessageDto.content!,
    );
    return MessageMapper.toDto(message);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a message' })
  @ApiParam({
    name: 'id',
    description: 'Message ID',
    example: '67409b2f88a7c7eae01c4e91',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message deleted successfully',
    type: MessageResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid message ID format',
  })
  @ApiNotFoundResponse({
    description: 'Message not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid message ID format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Message not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async remove(@Param('id') id: string): Promise<MessageResponseDto> {
    const message = await this.deleteMessageUseCase.execute(id);
    return MessageMapper.toDto(message);
  }

  @Delete('room/:roomId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete all messages in a room' })
  @ApiParam({
    name: 'roomId',
    description: 'Room ID',
    example: '67409b2f88a7c7eae01c4e91',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Room messages deleted successfully',
    schema: {
      properties: {
        deletedCount: { type: 'number', example: 5 },
        message: {
          type: 'string',
          example:
            'Successfully deleted 5 messages from room 67409b2f88a7c7eae01c4e91',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid room ID format',
  })
  @ApiNotFoundResponse({
    description: 'No messages found in this room',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid room ID format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No messages found in this room',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async removeByRoom(
    @Param('roomId') roomId: string,
  ): Promise<{ deletedCount: number; message: string }> {
    return await this.deleteMessagesByRoomUseCase.execute(roomId);
  }
}
