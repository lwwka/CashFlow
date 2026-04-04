import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { IsNumber, IsOptional, IsString, IsUUID, Matches, Min } from 'class-validator';

class BudgetDto {
  @Matches(/^[0-9]{4}-(0[1-9]|1[0-2])$/)
  month!: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount!: number;
}

@Controller('budgets')
export class BudgetsController {
  @Get()
  list(@Query('month') month: string): { month: string; items: unknown[] } {
    return { month, items: [] };
  }

  @Post()
  upsert(@Body() body: BudgetDto): BudgetDto {
    return body;
  }

  @Patch()
  patch(@Body() body: BudgetDto): BudgetDto {
    return body;
  }
}
