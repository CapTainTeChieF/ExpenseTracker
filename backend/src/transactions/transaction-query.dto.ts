import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID, Matches } from 'class-validator';
import { TransactionKind } from './transaction.dto';
export class TransactionListQueryDto {
  @ApiPropertyOptional({example:'2026-11'})
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {message: 'month must be YYYY-MM'})
  month?: string;

  @ApiPropertyOptional({enum:TransactionKind})
  @IsOptional()
  @IsEnum(TransactionKind)
  kind?: TransactionKind;

  @ApiPropertyOptional({type:String,format:'uuid'})
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
