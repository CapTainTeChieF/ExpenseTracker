import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';

export class MonthQueryDto {
  @ApiProperty({example:'2026-11'})
  @IsNotEmpty()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {message:'month must be in YYYY-MM format'})
  month!: string;
}
