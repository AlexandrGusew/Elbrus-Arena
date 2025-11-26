import { MonsterAI } from './monster-ai';
import type { Zone } from '../../../../shared/types/battle.types';

describe('MonsterAI', () => {
  const VALID_ZONES: Zone[] = ['head', 'body', 'legs', 'arms'];

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

    it('должен генерировать атаки с валидными зонами', () => {
      const actions = MonsterAI.generateActions();

      expect(VALID_ZONES).toContain(actions.attacks[0]);
      expect(VALID_ZONES).toContain(actions.attacks[1]);
    });

    it('должен генерировать защиты с валидными зонами', () => {
      const actions = MonsterAI.generateActions();

      expect(VALID_ZONES).toContain(actions.defenses[0]);
      expect(VALID_ZONES).toContain(actions.defenses[1]);
      expect(VALID_ZONES).toContain(actions.defenses[2]);
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
        expect(VALID_ZONES).toContain(actions.attacks[0]);
        expect(VALID_ZONES).toContain(actions.attacks[1]);
        expect(VALID_ZONES).toContain(actions.defenses[0]);
        expect(VALID_ZONES).toContain(actions.defenses[1]);
        expect(VALID_ZONES).toContain(actions.defenses[2]);
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

    it('должен генерировать все 4 зоны при достаточном количестве вызовов', () => {
      const generatedZones = new Set<Zone>();

      // Делаем достаточно попыток чтобы покрыть все зоны
      for (let i = 0; i < 100; i++) {
        const actions = MonsterAI.generateActions();
        actions.attacks.forEach((zone) => generatedZones.add(zone));
        actions.defenses.forEach((zone) => generatedZones.add(zone));
      }

      // Проверяем что все 4 зоны были сгенерированы хотя бы раз
      expect(generatedZones.has('head')).toBe(true);
      expect(generatedZones.has('body')).toBe(true);
      expect(generatedZones.has('legs')).toBe(true);
      expect(generatedZones.has('arms')).toBe(true);
    });
  });
});