import { Module, forwardRef } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [forwardRef(() => RoomModule)],
  providers: [ValidationService],
  exports: [ValidationService],
})
export class CommonModule {}
