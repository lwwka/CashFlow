import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsNumber, IsString, Matches, Min } from 'class-validator';

import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FinancialGoalRecord, FinancialGoalsService } from './financial-goals.service';

class FinancialGoalQuery {
  @IsString()
  @Matches(/^[a-z0-9_]+$/)
  goalType!: string;
}

class UpsertFinancialGoalDto {
  @ApiProperty({ example: 'long_term_savings' })
  @IsString()
  @Matches(/^[a-z0-9_]+$/)
  goalType!: string;

  @ApiProperty({ example: 100000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  targetAmount!: number;
}

@ApiTags('financial-goals')
@Controller('financial-goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class FinancialGoalsController {
  constructor(private readonly financialGoalsService: FinancialGoalsService) {}

  @Get()
  @ApiQuery({ name: 'goalType', required: true, example: 'long_term_savings' })
  getFinancialGoal(@Query() query: FinancialGoalQuery, @CurrentUser() user: AuthUser): Promise<FinancialGoalRecord | null> {
    return this.financialGoalsService.getFinancialGoal(query.goalType, user.email);
  }

  @Put()
  upsertFinancialGoal(@Body() body: UpsertFinancialGoalDto, @CurrentUser() user: AuthUser): Promise<FinancialGoalRecord> {
    return this.financialGoalsService.upsertFinancialGoal({
      ...body,
      email: user.email,
    });
  }
}
