import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransactionRecord, TransactionsService, TransactionType } from './transactions.service';

enum TransactionTypeEnum {
  Income = 'income',
  Expense = 'expense',
}

class CreateTransactionDto {
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

}

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiQuery({ name: 'month', required: false, example: '2026-04' })
  @ApiQuery({ name: 'q', required: false, example: 'lunch' })
  list(@Query() query: QueryTransactionsDto, @CurrentUser() user: AuthUser): Promise<TransactionRecord[]> {
    return this.transactionsService.list({
      ...query,
      email: user.email,
    });
  }

  @Post()
  create(@Body() body: CreateTransactionDto, @CurrentUser() user: AuthUser): Promise<TransactionRecord> {
    return this.transactionsService.create({
      ...body,
      email: user.email,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateTransactionDto, @CurrentUser() user: AuthUser): Promise<TransactionRecord> {
    return this.transactionsService.update(id, {
      ...body,
      email: user.email,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser): Promise<{ id: string; deleted: true }> {
    return this.transactionsService.remove(id, user.email);
  }
}
