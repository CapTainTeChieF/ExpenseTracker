import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';
export enum TransactionKind { INCOME = 'INCOME', EXPENSE = 'EXPENSE' }
export class CreateTransactionDto {
  @ApiProperty({enum:TransactionKind,example:'EXPENSE'}) @IsEnum(TransactionKind) kind!: TransactionKind;
  @ApiProperty({example:'250.00'}) @IsString() @Matches(/^\d{1,12}(\.\d{1,2})?$/, { message: 'Amount must be a positive decimal with up to 2 digits' }) amount!: string;
  @ApiProperty({example:'2026-11-09'}) @IsISO8601({ strict:true }) transactionDate!: string;
  @ApiPropertyOptional({type:String,nullable:true}) @IsOptional() @IsUUID() categoryId?: string | null;
  @ApiPropertyOptional({example:'Lunch'}) @IsOptional() @IsString() @MaxLength(250) description?: string;
}
export class UpdateTransactionDto {
  // PATCH accepts a subset of fields from CreateTransactionDto.
  @ApiPropertyOptional({enum:TransactionKind}) @IsOptional() @IsEnum(TransactionKind) kind?: TransactionKind;
  @ApiPropertyOptional({example:'350.00'}) @IsOptional() @IsString() @Matches(/^\d{1,12}(\.\d{1,2})?$/) amount?: string;
  @ApiPropertyOptional({example:'2026-11-09'}) @IsOptional() @IsISO8601({ strict:true }) transactionDate?: string;
  @ApiPropertyOptional({type:String,nullable:true}) @IsOptional() @IsUUID() categoryId?: string | null;
  @ApiPropertyOptional({example:'Lunch'}) @IsOptional() @IsString() @MaxLength(250) description?: string;
}
