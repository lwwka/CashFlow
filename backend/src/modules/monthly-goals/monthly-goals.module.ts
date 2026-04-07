import { Module } from '@nestjs/common';

import { MonthlyGoalsController } from './monthly-goals.controller';
import { MonthlyGoalsService } from './monthly-goals.service';

@Module({
  controllers: [MonthlyGoalsController],
  providers: [MonthlyGoalsService],
})
export class MonthlyGoalsModule {}
