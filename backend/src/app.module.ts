import { Module } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { AuthResolver } from './auth/auth.resolver';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [AuthModule, ChatModule, DatabaseModule],
  providers: [AuthService, AuthResolver],
})
export class AppModule {}
