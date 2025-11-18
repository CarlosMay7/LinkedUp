import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateRoomDto } from './dto/dto/create-room.dto';
import { UpdateRoomDto } from './dto/dto/update-room.dto';
import { RoomResponseDto } from './dto/dto/room-response.dto';
import { CreateRoomUseCase } from '../../domain/use-cases/create-room.use-case';
import { FindAllRoomsUseCase } from '../../domain/use-cases/find-all-rooms.use-case';
import { FindRoomByIdUseCase } from '../../domain/use-cases/find-room-by-id.use-case';
import { UpdateRoomUseCase } from '../../domain/use-cases/update-room.use-case';
import { AddMemberUseCase } from '../../domain/use-cases/add-member.use-case';
import { RemoveMemberUseCase } from '../../domain/use-cases/remove-member.use-case';
import { FindRoomsByMemberUseCase } from '../../domain/use-cases/find-rooms-by-member.use-case';
import { RoomMapper } from '../mappers/room.mapper';

@ApiTags('room')
@Controller('room')
export class RoomController {
  constructor(
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly findAllRoomsUseCase: FindAllRoomsUseCase,
    private readonly findRoomByIdUseCase: FindRoomByIdUseCase,
    private readonly updateRoomUseCase: UpdateRoomUseCase,
    private readonly addMemberUseCase: AddMemberUseCase,
    private readonly removeMemberUseCase: RemoveMemberUseCase,
    private readonly findRoomsByMemberUseCase: FindRoomsByMemberUseCase,
  ) {}

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
    const room = await this.createRoomUseCase.execute(createRoomDto);
    return RoomMapper.toDto(room);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiResponse({
    status: 200,
    description: 'List of all rooms',
    type: [RoomResponseDto],
  })
  async findAll(): Promise<RoomResponseDto[]> {
    const rooms = await this.findAllRoomsUseCase.execute();
    return RoomMapper.toDtoArray(rooms);
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
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ): Promise<RoomResponseDto[]> {
    const rooms = await this.findRoomsByMemberUseCase.execute(memberId);
    return RoomMapper.toDtoArray(rooms);
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
    const room = await this.findRoomByIdUseCase.execute(id);
    return RoomMapper.toDto(room);
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
    const room = await this.updateRoomUseCase.execute(id, updateRoomDto);
    return RoomMapper.toDto(room);
  }

  @Patch(':id/members/:userId')
  @ApiOperation({ summary: 'Add member to room (partial update)' })
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
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<RoomResponseDto> {
    const room = await this.addMemberUseCase.execute(roomId, userId);
    return RoomMapper.toDto(room);
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
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<RoomResponseDto> {
    const room = await this.removeMemberUseCase.execute(roomId, userId);
    return RoomMapper.toDto(room);
  }
}
