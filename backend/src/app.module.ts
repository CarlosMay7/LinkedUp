import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { MongoDatabaseModule } from './database/mongo-database.module';
import { PostgresDatabaseModule } from './database/postgres-database.module';

@Module({
  imports: [AuthModule, ChatModule, MongoDatabaseModule, PostgresDatabaseModule],
})
export class AppModule {}
