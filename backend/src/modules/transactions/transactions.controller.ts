import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

import { TransactionRecord, TransactionsService, TransactionType } from './transactions.service';

enum TransactionTypeEnum {
  Income = 'income',
  Expense = 'expense',
}

class CreateTransactionDto {
  @IsEnum(TransactionTypeEnum)
  type!: TransactionType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @IsDateString()
  occurredOn!: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

class QueryTransactionsDto {
  @IsOptional()
  @IsString()
  month?: string;

  @IsOptional()
  @IsString()
  q?: string;
}

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  list(@Query() _query: QueryTransactionsDto): TransactionRecord[] {
    return this.transactionsService.list();
  }

  @Post()
  create(@Body() body: CreateTransactionDto): CreateTransactionDto {
    return body;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<CreateTransactionDto>): { id: string; payload: Partial<CreateTransactionDto> } {
    return { id, payload: body };
  }

  @Delete(':id')
  remove(@Param('id') id: string): { id: string; deleted: true } {
    return { id, deleted: true };
  }
}
