import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsDefined, IsEnum, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min, ValidateNested } from 'class-validator';

import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ImportRowsResult, TransactionRecord, TransactionsService, TransactionType } from './transactions.service';

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

class ImportTransactionRowDto {
  @ApiProperty({ example: '2026-04-05' })
  @IsDateString()
  occurredOn!: string;

  @ApiProperty({ enum: TransactionTypeEnum, example: 'expense' })
  @IsEnum(TransactionTypeEnum)
  type!: TransactionType;

  @ApiProperty({ example: 88.5 })
  @IsDefined()
  amount!: unknown;

  @ApiPropertyOptional({ example: 'Food' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  categoryName?: string;

  @ApiPropertyOptional({ example: 'Lunch with team' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

class ImportTransactionsDto {
  @ApiProperty({ type: [ImportTransactionRowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportTransactionRowDto)
  rows!: ImportTransactionRowDto[];
}

class QueryTransactionsDto {
  @ApiPropertyOptional({ example: '2026-04' })
  @IsOptional()
  @IsString()
  month?: string;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-04-30' })
  @IsOptional()
  @IsDateString()
  to?: string;

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
  @ApiQuery({ name: 'from', required: false, example: '2026-04-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-04-30' })
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

  @Post('import')
  importRows(
    @Body() body: ImportTransactionsDto,
    @CurrentUser() user: AuthUser,
  ): Promise<ImportRowsResult> {
    return this.transactionsService.importRows({
      email: user.email,
      rows: body.rows as Array<{
        occurredOn: string;
        type: TransactionType;
        amount: unknown;
        categoryName?: string;
        note?: string;
      }>,
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
