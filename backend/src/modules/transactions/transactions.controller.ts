import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { TransactionRecord, TransactionsService, TransactionType } from './transactions.service';

enum TransactionTypeEnum {
  Income = 'income',
  Expense = 'expense',
}

class CreateTransactionDto {
  @ApiPropertyOptional({ example: 'demo@cashflow.local' })
  @IsOptional()
  @IsString()
  userEmail?: string;

  @ApiProperty({ enum: TransactionTypeEnum, example: 'expense' })
  @IsEnum(TransactionTypeEnum)
  type!: TransactionType;

  @ApiProperty({ example: 88.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: '2026-04-05' })
  @IsDateString()
  occurredOn!: string;

  @ApiPropertyOptional({ example: '11111111-1111-1111-1111-111111111111' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'Lunch' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

class UpdateTransactionDto {
  @ApiPropertyOptional({ example: 'demo@cashflow.local' })
  @IsOptional()
  @IsString()
  userEmail?: string;

  @ApiPropertyOptional({ enum: TransactionTypeEnum, example: 'expense' })
  @IsOptional()
  @IsEnum(TransactionTypeEnum)
  type?: TransactionType;

  @ApiPropertyOptional({ example: 88.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ example: '2026-04-05' })
  @IsOptional()
  @IsDateString()
  occurredOn?: string;

  @ApiPropertyOptional({ example: '11111111-1111-1111-1111-111111111111' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'Updated lunch note' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

class QueryTransactionsDto {
  @ApiPropertyOptional({ example: '2026-04' })
  @IsOptional()
  @IsString()
  month?: string;

  @ApiPropertyOptional({ example: 'lunch' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 'demo@cashflow.local' })
  @IsOptional()
  @IsString()
  userEmail?: string;
}

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(OptionalJwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiQuery({ name: 'month', required: false, example: '2026-04' })
  @ApiQuery({ name: 'q', required: false, example: 'lunch' })
  @ApiQuery({ name: 'userEmail', required: false, example: 'demo@cashflow.local' })
  list(@Query() query: QueryTransactionsDto, @CurrentUser() user: AuthUser | null): Promise<TransactionRecord[]> {
    return this.transactionsService.list({
      ...query,
      userEmail: user?.email ?? query.userEmail,
    });
  }

  @Post()
  create(@Body() body: CreateTransactionDto, @CurrentUser() user: AuthUser | null): Promise<TransactionRecord> {
    return this.transactionsService.create({
      ...body,
      userEmail: user?.email ?? body.userEmail,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateTransactionDto, @CurrentUser() user: AuthUser | null): Promise<TransactionRecord> {
    return this.transactionsService.update(id, {
      ...body,
      userEmail: user?.email ?? body.userEmail,
    });
  }

  @Delete(':id')
  @ApiQuery({ name: 'userEmail', required: false, example: 'demo@cashflow.local' })
  remove(@Param('id') id: string, @Query('userEmail') userEmail: string | undefined, @CurrentUser() user: AuthUser | null): Promise<{ id: string; deleted: true }> {
    return this.transactionsService.remove(id, user?.email ?? userEmail);
  }
}
