import { Module } from '@nestjs/common';
import { JobProposalController } from './job-proposal.controller';
import { JobProposalService } from './job-proposal.service';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [JobProposalController],
  providers: [JobProposalService],
  exports: [JobProposalService],
})
export class JobProposalModule {}
