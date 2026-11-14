import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangeInitialPasswordDto {
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  newPassword!: string;
}
