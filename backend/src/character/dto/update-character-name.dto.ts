import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class UpdateCharacterNameDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  name: string;
}

