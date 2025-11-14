import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RoomResponseDto } from './dto/room-response.dto';

@ApiTags('room')
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({
    status: 201,
    description: 'Room created successfully',
    type: RoomResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Room already exists' })
  async create(@Body() createRoomDto: CreateRoomDto): Promise<RoomResponseDto> {
    return this.roomService.create(createRoomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiResponse({
    status: 200,
    description: 'List of all rooms',
    type: [RoomResponseDto],
  })
  async findAll(): Promise<RoomResponseDto[]> {
    return this.roomService.findAll();
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Get rooms by member ID' })
  @ApiParam({ name: 'memberId', description: 'Member user ID to filter rooms' })
  @ApiResponse({
    status: 200,
    description: 'List of rooms the member belongs to',
    type: [RoomResponseDto],
  })
  async findByMember(
    @Param('memberId') memberId: string,
  ): Promise<RoomResponseDto[]> {
    return this.roomService.findByMember(memberId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiResponse({
    status: 200,
    description: 'Room found',
    type: RoomResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 400, description: 'Invalid room ID format' })
  async findOne(@Param('id') id: string): Promise<RoomResponseDto> {
    return this.roomService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update room information' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiResponse({
    status: 200,
    description: 'Room updated successfully',
    type: RoomResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 409, description: 'Room name already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ): Promise<RoomResponseDto> {
    return this.roomService.updateRoom(id, updateRoomDto);
  }

  @Post(':id/members/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add member to room' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiParam({ name: 'userId', description: 'User ID to add' })
  @ApiResponse({
    status: 200,
    description: 'Member added successfully',
    type: RoomResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 409, description: 'User is already a member' })
  async addMember(
    @Param('id') roomId: string,
    @Param('userId') userId: string,
  ): Promise<RoomResponseDto> {
    return this.roomService.addMember(roomId, userId);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove member from room' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiParam({ name: 'userId', description: 'User ID to remove' })
  @ApiResponse({
    status: 200,
    description: 'Member removed successfully',
    type: RoomResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async removeMember(
    @Param('id') roomId: string,
    @Param('userId') userId: string,
  ): Promise<RoomResponseDto> {
    return this.roomService.removeMember(roomId, userId);
  }
}
