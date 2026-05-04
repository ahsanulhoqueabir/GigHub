import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import configuration, { validationSchema } from '@/config/configuration';
import { AllExceptionsFilter } from '@/common/filters/http-exception.filter';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { AuthModule } from '@/modules/auth/auth.module';
import { ProfileModule } from '@/modules/profile/profile.module';
import { CategoryModule } from '@/modules/category/category.module';
import { UploadModule } from '@/modules/upload/upload.module';
import { GigsModule } from '@/modules/gigs/gigs.module';
import { OrdersModule } from '@/modules/orders/orders.module';
import { PaymentsModule } from '@/modules/payments/payments.module';
import { EscrowModule } from '@/modules/escrow/escrow.module';
import { WithdrawalsModule } from '@/modules/withdrawals/withdrawals.module';
import { JobsModule } from '@/modules/jobs/jobs.module';
import { ProposalsModule } from '@/modules/proposals/proposals.module';
import { SearchModule } from '@/modules/search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 60,
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 5,
      },
    ]),
    AuthModule,
    ProfileModule,
    CategoryModule,
    UploadModule,
    GigsModule,
    OrdersModule,
    PaymentsModule,
    EscrowModule,
    WithdrawalsModule,
    JobsModule,
    ProposalsModule,
    SearchModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
