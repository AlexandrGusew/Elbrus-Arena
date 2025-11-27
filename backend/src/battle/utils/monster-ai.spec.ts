import { MonsterAI } from './monster-ai';
import type { Zone } from '../../../../shared/types/battle.types';

describe('MonsterAI', () => {
  const VALID_ATTACK_ZONES: Zone[] = ['head', 'body', 'legs', 'arms'];
  const VALID_DEFENSE_ZONES: Zone[] = ['head', 'body', 'legs', 'arms', 'back'];

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateActions', () => {
    it('должен сгенерировать действия с корректной структурой', () => {
      const actions = MonsterAI.generateActions();

      expect(actions).toHaveProperty('attacks');
      expect(actions).toHaveProperty('defenses');
      expect(actions.attacks).toHaveLength(2);
      expect(actions.defenses).toHaveLength(3);
    });

    it('должен генерировать атаки только из 4 зон (без "back")', () => {
      const actions = MonsterAI.generateActions();

      expect(VALID_ATTACK_ZONES).toContain(actions.attacks[0]);
      expect(VALID_ATTACK_ZONES).toContain(actions.attacks[1]);
      // Проверяем что "back" НЕ используется в атаках
      expect(actions.attacks[0]).not.toBe('back');
      expect(actions.attacks[1]).not.toBe('back');
    });

    it('должен генерировать защиты из 5 зон (включая "back")', () => {
      const actions = MonsterAI.generateActions();

      expect(VALID_DEFENSE_ZONES).toContain(actions.defenses[0]);
      expect(VALID_DEFENSE_ZONES).toContain(actions.defenses[1]);
      expect(VALID_DEFENSE_ZONES).toContain(actions.defenses[2]);
    });

    it('монстр НИКОГДА не должен атаковать в зону "back"', () => {
      // Проверяем 100 раз чтобы убедиться
      for (let i = 0; i < 100; i++) {
        const actions = MonsterAI.generateActions();
        expect(actions.attacks[0]).not.toBe('back');
        expect(actions.attacks[1]).not.toBe('back');
      }
    });

    it('монстр МОЖЕТ защищать зону "back"', () => {
      let hasBackDefense = false;

      // Проверяем достаточно раз чтобы найти "back" в защите
      for (let i = 0; i < 100; i++) {
        const actions = MonsterAI.generateActions();
        if (actions.defenses.includes('back')) {
          hasBackDefense = true;
          break;
        }
      }

      expect(hasBackDefense).toBe(true);
    });

    it('должен генерировать разные комбинации при разных вызовах', () => {
      const actions1 = MonsterAI.generateActions();
      const actions2 = MonsterAI.generateActions();
      const actions3 = MonsterAI.generateActions();

      // Проверяем что не все три результата идентичны
      // (с вероятностью 1/(4^5)^3 это может случайно не пройти, но шанс крайне мал)
      const allIdentical =
        JSON.stringify(actions1) === JSON.stringify(actions2) &&
        JSON.stringify(actions2) === JSON.stringify(actions3);

      expect(allIdentical).toBe(false);
    });

    it('должен сгенерировать конкретные зоны при моке Math.random', () => {
      // Мокируем Math.random для предсказуемого результата
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0)    // 'head' для первой атаки
        .mockReturnValueOnce(0.25) // 'body' для второй атаки
        .mockReturnValueOnce(0.5)  // 'legs' для первой защиты
        .mockReturnValueOnce(0.75) // 'arms' для второй защиты
        .mockReturnValueOnce(0);   // 'head' для третьей защиты

      const actions = MonsterAI.generateActions();

      expect(actions.attacks[0]).toBe('head');
      expect(actions.attacks[1]).toBe('body');
      expect(actions.defenses[0]).toBe('legs');
      expect(actions.defenses[1]).toBe('arms');
      expect(actions.defenses[2]).toBe('head');
    });

    it('должен генерировать действия 100 раз без ошибок', () => {
      for (let i = 0; i < 100; i++) {
        const actions = MonsterAI.generateActions();

        expect(actions.attacks).toHaveLength(2);
        expect(actions.defenses).toHaveLength(3);
        expect(VALID_ATTACK_ZONES).toContain(actions.attacks[0]);
        expect(VALID_ATTACK_ZONES).toContain(actions.attacks[1]);
        expect(VALID_DEFENSE_ZONES).toContain(actions.defenses[0]);
        expect(VALID_DEFENSE_ZONES).toContain(actions.defenses[1]);
        expect(VALID_DEFENSE_ZONES).toContain(actions.defenses[2]);
      }
    });

    it('должен иногда генерировать одинаковые зоны для атак', () => {
      let foundSameAttacks = false;

      // Запускаем 50 раз, чтобы найти хотя бы один случай
      for (let i = 0; i < 50; i++) {
        const actions = MonsterAI.generateActions();
        if (actions.attacks[0] === actions.attacks[1]) {
          foundSameAttacks = true;
          break;
        }
      }

      // С вероятностью 1/4 для каждой попытки, за 50 попыток почти гарантированно найдется
      expect(foundSameAttacks).toBe(true);
    });

    it('должен иногда генерировать повторяющиеся зоны в защитах', () => {
      let foundSameDefenses = false;

      // Запускаем 50 раз
      for (let i = 0; i < 50; i++) {
        const actions = MonsterAI.generateActions();
        const defenses = actions.defenses;

        if (
          defenses[0] === defenses[1] ||
          defenses[1] === defenses[2] ||
          defenses[0] === defenses[2]
        ) {
          foundSameDefenses = true;
          break;
        }
      }

      expect(foundSameDefenses).toBe(true);
    });

    it('должен генерировать все 4 зоны атаки при достаточном количестве вызовов', () => {
      const generatedAttackZones = new Set<Zone>();

      // Делаем достаточно попыток чтобы покрыть все зоны атаки
      for (let i = 0; i < 100; i++) {
        const actions = MonsterAI.generateActions();
        actions.attacks.forEach((zone) => generatedAttackZones.add(zone));
      }

      // Проверяем что все 4 зоны атаки были сгенерированы хотя бы раз
      expect(generatedAttackZones.has('head')).toBe(true);
      expect(generatedAttackZones.has('body')).toBe(true);
      expect(generatedAttackZones.has('legs')).toBe(true);
      expect(generatedAttackZones.has('arms')).toBe(true);
      // И что "back" НЕ был сгенерирован в атаках
      expect(generatedAttackZones.has('back')).toBe(false);
    });

    it('должен генерировать все 5 зон защиты при достаточном количестве вызовов', () => {
      const generatedDefenseZones = new Set<Zone>();

      // Делаем достаточно попыток чтобы покрыть все зоны защиты
      for (let i = 0; i < 200; i++) {
        const actions = MonsterAI.generateActions();
        actions.defenses.forEach((zone) => generatedDefenseZones.add(zone));
      }

      // Проверяем что все 5 зон защиты были сгенерированы хотя бы раз
      expect(generatedDefenseZones.has('head')).toBe(true);
      expect(generatedDefenseZones.has('body')).toBe(true);
      expect(generatedDefenseZones.has('legs')).toBe(true);
      expect(generatedDefenseZones.has('arms')).toBe(true);
      expect(generatedDefenseZones.has('back')).toBe(true);
    });
  });
});