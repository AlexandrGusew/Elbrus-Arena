import { IsNumber, IsString, IsIn } from 'class-validator';
import { CHARACTER_CLASSES } from '../../../../shared/types/enums';

export class CreateCharacterDto {
  @IsNumber()
  telegramId: number;

  @IsString()
  name: string;

  @IsIn(CHARACTER_CLASSES, { message: 'Class must be one of: warrior, mage, rogue' })
  class: typeof CHARACTER_CLASSES[number];
}

