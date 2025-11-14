import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './schemas/message.schema';

@ApiTags('messages')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  /**
   * Create a new message
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Message created successfully',
    type: Message,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or invalid MongoDB IDs',
  })
  async create(@Body() createMessageDto: CreateMessageDto) {
    return await this.messageService.create(createMessageDto);
  }

  /**
   * Get all messages
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all messages' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all messages',
    type: [Message],
  })
  async findAll() {
    return await this.messageService.findAll();
  }

  /**
   * Get messages filtered by sender and/or receiver
   */
  @Get('users/filter')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get messages filtered by sender and/or receiver',
  })
  @ApiQuery({
    name: 'senderId',
    required: false,
    description: 'Filter by sender ID',
    example: '673fa9b1d5f7a1b3e56a3e12',
  })
  @ApiQuery({
    name: 'receiverId',
    required: false,
    description: 'Filter by receiver ID',
    example: '673fa9b1d5f7a1b3e56a3e13',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Filtered messages',
    type: [Message],
  })
  @ApiBadRequestResponse({
    description: 'Invalid user IDs format',
  })
  async findByUsers(
    @Query('senderId') senderId?: string,
    @Query('receiverId') receiverId?: string,
  ) {
    return await this.messageService.findByUsers(senderId, receiverId);
  }

  /**
   * Get a specific message by ID
   */
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
    type: Message,
  })
  @ApiBadRequestResponse({
    description: 'Invalid message ID format',
  })
  @ApiNotFoundResponse({
    description: 'Message not found',
  })
  async findOne(@Param('id') id: string) {
    return await this.messageService.findOne(id);
  }

  /**
   * Get all messages in a specific room
   */
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
    type: [Message],
  })
  @ApiBadRequestResponse({
    description: 'Invalid room ID format',
  })
  async findByRoom(@Param('roomId') roomId: string) {
    return await this.messageService.findByRoom(roomId);
  }

  /**
   * Get private conversation between two users
   */
  @Get('conversation/:userId1/:userId2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get private conversation between two users',
  })
  @ApiParam({
    name: 'userId1',
    description: 'First user ID',
    example: '673fa9b1d5f7a1b3e56a3e12',
  })
  @ApiParam({
    name: 'userId2',
    description: 'Second user ID',
    example: '673fa9b1d5f7a1b3e56a3e13',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Private conversation messages',
    type: [Message],
  })
  @ApiBadRequestResponse({
    description: 'Invalid user IDs format',
  })
  async findConversation(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
  ) {
    return await this.messageService.findConversation(userId1, userId2);
  }

  /**
   * Update a message
   */
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
    type: Message,
  })
  @ApiBadRequestResponse({
    description: 'Invalid message ID format or invalid input data',
  })
  @ApiNotFoundResponse({
    description: 'Message not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return await this.messageService.update(id, updateMessageDto);
  }

  /**
   * Delete a message
   */
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
    type: Message,
  })
  @ApiBadRequestResponse({
    description: 'Invalid message ID format',
  })
  @ApiNotFoundResponse({
    description: 'Message not found',
  })
  async remove(@Param('id') id: string) {
    return await this.messageService.remove(id);
  }

  /**
   * Delete all messages in a room
   */
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
  async removeByRoom(@Param('roomId') roomId: string) {
    return await this.messageService.removeByRoom(roomId);
  }
}
