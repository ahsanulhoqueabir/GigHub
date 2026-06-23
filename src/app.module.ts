import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [DatabaseModule, FirebaseModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


