import { Type } from 'class-transformer';
import { IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TrendQueryDto {
  @ApiPropertyOptional({example:6,minimum:1,maximum:12,description:'Number of months'})
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(12)
  months?: number;

  @ApiPropertyOptional({example:'2026-11',description:'Last month in YYYY-MM format'})
  @IsOptional() @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  endMonth?: string;
}
