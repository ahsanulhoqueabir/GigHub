import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { AdminUsersController } from './admin-users.controller';

@Module({
  providers: [ProfileService],
  controllers: [ProfileController, AdminUsersController],
  exports: [ProfileService],
})
export class ProfileModule {}
