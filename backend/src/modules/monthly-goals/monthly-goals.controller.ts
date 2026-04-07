import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsNumber, Matches, Min } from 'class-validator';

import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MonthlyGoalRecord, MonthlyGoalsService } from './monthly-goals.service';

class MonthlyGoalQuery {
  @Matches(/^[0-9]{4}-(0[1-9]|1[0-2])$/)
  month!: string;
}

class UpsertMonthlyGoalDto {
  @ApiProperty({ example: '2026-04' })
  @Matches(/^[0-9]{4}-(0[1-9]|1[0-2])$/)
  month!: string;

  @ApiProperty({ example: 18000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  savingsTarget!: number;
}

@ApiTags('monthly-goals')
@Controller('monthly-goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MonthlyGoalsController {
  constructor(private readonly monthlyGoalsService: MonthlyGoalsService) {}

  @Get()
  @ApiQuery({ name: 'month', required: true, example: '2026-04' })
  getMonthlyGoal(@Query() query: MonthlyGoalQuery, @CurrentUser() user: AuthUser): Promise<MonthlyGoalRecord | null> {
    return this.monthlyGoalsService.getMonthlyGoal(query.month, user.email);
  }

  @Put()
  upsertMonthlyGoal(@Body() body: UpsertMonthlyGoalDto, @CurrentUser() user: AuthUser): Promise<MonthlyGoalRecord> {
    return this.monthlyGoalsService.upsertMonthlyGoal({
      ...body,
      email: user.email,
    });
  }
}
