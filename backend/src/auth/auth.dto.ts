import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';
export class RegisterDto {
  @ApiProperty({example:'Amina'}) @IsString() @IsNotEmpty() @MaxLength(100) name!: string;
  @ApiProperty({example:'amina@example.com'}) @IsEmail() @MaxLength(254) email!: string;
  @ApiProperty({minLength:12}) @IsString() @Length(12, 128) password!: string;
}
export class LoginDto {
  @ApiProperty({example:'amina@example.com'}) @IsEmail() email!: string;
  @ApiProperty() @IsString() password!: string;
}
