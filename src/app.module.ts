import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { FirebaseModule } from './firebase/firebase.module';
import { StorageModule } from './storage/storage.module';
import { ProfileModule } from './profile/profile.module';
import { CategoryModule } from './category/category.module';
import { GigModule } from './gig/gig.module';
import { JobModule } from './job/job.module';
import { JobProposalModule } from './job-proposal/job-proposal.module';
import { OrderModule } from './order/order.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    DatabaseModule,
    FirebaseModule,
    AuthModule,
    StorageModule,
    ProfileModule,
    CategoryModule,
    GigModule,
    JobModule,
    JobProposalModule,
    OrderModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

