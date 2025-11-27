import { IsArray, IsIn, ArrayMinSize, ArrayMaxSize, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import type { Zone } from '../../../../shared/types/battle.types';

// Проверка уникальности элементов массива
@ValidatorConstraint({ name: 'UniqueArray', async: false })
export class UniqueArrayValidator implements ValidatorConstraintInterface {
  validate(array: any[], args: ValidationArguments) {
    if (!Array.isArray(array)) return false;
    return new Set(array).size === array.length;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Все элементы массива должны быть уникальными';
  }
}

// Допустимые значения зон для атаки (включая спину для Shadow Dancer)
const VALID_ATTACK_ZONES: Zone[] = ['head', 'body', 'legs', 'arms', 'back'];

// Допустимые значения зон для защиты (спину защитить нельзя)
const VALID_DEFENSE_ZONES: Zone[] = ['head', 'body', 'legs', 'arms'];

export class RoundActionsDto {
  @IsArray({ message: 'Поле attacks должно быть массивом' })
  @ArrayMinSize(2, { message: 'Необходимо выбрать ровно 2 зоны атаки' })
  @ArrayMaxSize(2, { message: 'Необходимо выбрать ровно 2 зоны атаки' })
  @IsIn(VALID_ATTACK_ZONES, { each: true, message: 'Неверная зона атаки. Допустимые: head, body, legs, arms, back' })
  attacks: Zone[];

  @IsArray({ message: 'Поле defenses должно быть массивом' })
  @ArrayMinSize(3, { message: 'Необходимо выбрать ровно 3 зоны защиты' })
  @ArrayMaxSize(3, { message: 'Необходимо выбрать ровно 3 зоны защиты' })
  @IsIn(VALID_DEFENSE_ZONES, { each: true, message: 'Неверная зона защиты. Допустимые: head, body, legs, arms' })
  @Validate(UniqueArrayValidator, { message: 'Нельзя защищать одну зону несколько раз' })
  defenses: Zone[];
}
