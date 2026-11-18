import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { TransactionKind } from '../transactions/transaction.dto';

export class CreateCategoryDto {
  @ApiProperty({example:'Food',minLength:2,maxLength:60})
  @IsString() @MinLength(2) @MaxLength(60)
  name!: string;

  @ApiProperty({enum:TransactionKind,example:'EXPENSE'})
  @IsEnum(TransactionKind)
  kind!: TransactionKind;
}

// The category kind is immutable once created: rename only.
// Existing transactions must never become inconsistent with their category kind.
export class RenameCategoryDto {
  @ApiProperty({example:'Food',minLength:2,maxLength:60})
  @IsString() @MinLength(2) @MaxLength(60)
  name!: string;
}
