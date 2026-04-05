import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Matches, MaxLength, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { DevSeedService } from './dev-seed.service';

enum TransactionTypeEnum {
  Income = 'income',
  Expense = 'expense',
}

class SeedCategoryDto {
  @IsString()
  @MaxLength(64)
  name!: string;

  @IsEnum(TransactionTypeEnum)
  type!: 'income' | 'expense';
}

class SeedTransactionDto {
  @IsEnum(TransactionTypeEnum)
  type!: 'income' | 'expense';

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  occurredOn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  categoryName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

class SeedBudgetDto {
  @Matches(/^[0-9]{4}-(0[1-9]|1[0-2])$/)
  month!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  categoryName?: string;
}

export class SeedRequestDto {
  @IsEmail()
  userEmail!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  passwordHash?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeedCategoryDto)
  categories!: SeedCategoryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeedTransactionDto)
  transactions!: SeedTransactionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeedBudgetDto)
  budgets!: SeedBudgetDto[];
}

const seedExample = {
  userEmail: 'demo@cashflow.local',
  passwordHash: 'demo-password-hash',
  categories: [
    { name: 'Salary', type: 'income' },
    { name: 'Food', type: 'expense' },
    { name: 'Transport', type: 'expense' },
  ],
  transactions: [
    { type: 'income', amount: 50000, occurredOn: '2026-04-01', categoryName: 'Salary', note: 'April salary' },
    { type: 'expense', amount: 120.5, occurredOn: '2026-04-03', categoryName: 'Food', note: 'Lunch' },
    { type: 'expense', amount: 45, occurredOn: '2026-04-04', categoryName: 'Transport', note: 'MRT' },
  ],
  budgets: [
    { month: '2026-04', categoryName: 'Food', amount: 3000 },
    { month: '2026-04', categoryName: 'Transport', amount: 1200 },
    { month: '2026-04', amount: 10000 },
  ],
};

@ApiTags('dev-seed')
@Controller('dev/seed')
export class DevSeedController {
  constructor(private readonly devSeedService: DevSeedService) {}

  @Post()
  @ApiOperation({ summary: 'Load demo data into PostgreSQL for local development.' })
  @ApiBody({
    description: 'Paste this JSON in Swagger and run it to seed the cashflow database.',
    schema: {
      example: seedExample,
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Seed data inserted successfully.',
    schema: {
      example: {
        message: 'seed loaded',
        userEmail: 'demo@cashflow.local',
        inserted: {
          categories: 3,
          transactions: 3,
          budgets: 3,
        },
      },
    },
  })
  load(@Body() body: SeedRequestDto): Promise<{
    message: string;
    userEmail: string;
    inserted: { categories: number; transactions: number; budgets: number };
  }> {
    return this.devSeedService.load(body);
  }
}
