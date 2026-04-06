import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './modules/auth/auth.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DevSeedModule } from './modules/dev-seed/dev-seed.module';
import { HealthModule } from './modules/health/health.module';
import { OverviewModule } from './modules/overview/overview.module';
import { ReportsModule } from './modules/reports/reports.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    TransactionsModule,
    CategoriesModule,
    BudgetsModule,
    OverviewModule,
    ReportsModule,
    DevSeedModule,
  ],
})
export class AppModule {}
