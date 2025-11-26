import { CombatCalculator } from './combat-calculator';
import type { Zone } from '../../../../shared/types/battle.types';

describe('CombatCalculator', () => {
  describe('calculateDamage', () => {
    const baseDamage = 20;
    const armor = 10;

    it('должен нанести полный урон когда ни одна атака не заблокирована', () => {
      const attacks: [Zone, Zone] = ['head', 'body'];
      const defenses: [Zone, Zone, Zone] = ['left_hand', 'right_hand', 'legs'];

      const result = CombatCalculator.calculateDamage(attacks, defenses, baseDamage, armor);

      // Обе атаки прошли: 20 + 20 = 40
      expect(result).toBe(40);
    });

    it('должен уменьшить урон когда атака заблокирована', () => {
      const attacks: [Zone, Zone] = ['head', 'body'];
      const defenses: [Zone, Zone, Zone] = ['head', 'left_hand', 'right_hand'];

      const result = CombatCalculator.calculateDamage(attacks, defenses, baseDamage, armor);

      // head заблокирован: 20 - (10 * 0.3) = 20 - 3 = 17
      // body прошел: 20
      // Итого: 17 + 20 = 37
      expect(result).toBe(37);
    });

    it('должен уменьшить урон для обеих заблокированных атак', () => {
      const attacks: [Zone, Zone] = ['head', 'body'];
      const defenses: [Zone, Zone, Zone] = ['head', 'body', 'legs'];

      const result = CombatCalculator.calculateDamage(attacks, defenses, baseDamage, armor);

      // head заблокирован: 20 - 3 = 17
      // body заблокирован: 20 - 3 = 17
      // Итого: 17 + 17 = 34
      expect(result).toBe(34);
    });

    it('должен вернуть 0 урона если базовый урон 0', () => {
      const attacks: [Zone, Zone] = ['head', 'body'];
      const defenses: [Zone, Zone, Zone] = ['left_hand', 'right_hand', 'legs'];

      const result = CombatCalculator.calculateDamage(attacks, defenses, 0, armor);

      expect(result).toBe(0);
    });

    it('должен корректно работать с высокой броней', () => {
      const highArmor = 100;
      const attacks: [Zone, Zone] = ['head', 'body'];
      const defenses: [Zone, Zone, Zone] = ['head', 'body', 'legs'];

      const result = CombatCalculator.calculateDamage(attacks, defenses, baseDamage, highArmor);

      // head заблокирован: max(0, 20 - 30) = 0
      // body заблокирован: max(0, 20 - 30) = 0
      // Итого: 0 + 0 = 0
      expect(result).toBe(0);
    });

    it('должен корректно работать без брони', () => {
      const attacks: [Zone, Zone] = ['head', 'body'];
      const defenses: [Zone, Zone, Zone] = ['head', 'body', 'legs'];

      const result = CombatCalculator.calculateDamage(attacks, defenses, baseDamage, 0);

      // head заблокирован: 20 - 0 = 20
      // body заблокирован: 20 - 0 = 20
      // Итого: 20 + 20 = 40
      expect(result).toBe(40);
    });

    it('должен округлить урон вниз', () => {
      const attacks: [Zone, Zone] = ['head', 'body'];
      const defenses: [Zone, Zone, Zone] = ['head', 'left_hand', 'right_hand'];
      const oddArmor = 7;

      const result = CombatCalculator.calculateDamage(attacks, defenses, baseDamage, oddArmor);

      // head заблокирован: 20 - (7 * 0.3) = 20 - 2.1 = 17.9
      // body прошел: 20
      // Итого: 17.9 + 20 = 37.9 -> floor = 37
      expect(result).toBe(37);
    });

    it('должен работать с атаками в разные зоны', () => {
      const attacks: [Zone, Zone] = ['left_hand', 'right_hand'];
      const defenses: [Zone, Zone, Zone] = ['head', 'body', 'legs'];

      const result = CombatCalculator.calculateDamage(attacks, defenses, baseDamage, armor);

      // Обе атаки прошли: 20 + 20 = 40
      expect(result).toBe(40);
    });

    it('должен блокировать атаку когда та же зона в защите', () => {
      const attacks: [Zone, Zone] = ['legs', 'legs'];
      const defenses: [Zone, Zone, Zone] = ['legs', 'head', 'body'];

      const result = CombatCalculator.calculateDamage(attacks, defenses, baseDamage, armor);

      // Обе атаки в legs заблокированы: (20 - 3) + (20 - 3) = 34
      expect(result).toBe(34);
    });

    it('должен корректно работать с одной заблокированной из двух', () => {
      const attacks: [Zone, Zone] = ['head', 'legs'];
      const defenses: [Zone, Zone, Zone] = ['body', 'left_hand', 'legs'];

      const result = CombatCalculator.calculateDamage(attacks, defenses, baseDamage, armor);

      // head прошел: 20
      // legs заблокирован: 20 - 3 = 17
      // Итого: 20 + 17 = 37
      expect(result).toBe(37);
    });

    it('должен работать с низким уроном и высокой броней', () => {
      const lowDamage = 5;
      const highArmor = 20;
      const attacks: [Zone, Zone] = ['head', 'body'];
      const defenses: [Zone, Zone, Zone] = ['head', 'body', 'legs'];

      const result = CombatCalculator.calculateDamage(attacks, defenses, lowDamage, highArmor);

      // head заблокирован: max(0, 5 - 6) = 0
      // body заблокирован: max(0, 5 - 6) = 0
      // Итого: 0 + 0 = 0
      expect(result).toBe(0);
    });

    it('должен работать с высоким уроном', () => {
      const highDamage = 100;
      const attacks: [Zone, Zone] = ['head', 'body'];
      const defenses: [Zone, Zone, Zone] = ['head', 'left_hand', 'right_hand'];

      const result = CombatCalculator.calculateDamage(attacks, defenses, highDamage, armor);

      // head заблокирован: 100 - 3 = 97
      // body прошел: 100
      // Итого: 97 + 100 = 197
      expect(result).toBe(197);
    });
  });
});