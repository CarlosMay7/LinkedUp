import { Module } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [RoomModule],
  providers: [ValidationService],
  exports: [ValidationService],
})
export class CommonModule {}
