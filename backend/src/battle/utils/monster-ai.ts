import type { Zone, RoundActions } from '../../../../shared/types/battle.types';

export class MonsterAI {
  private static readonly ATTACK_ZONES: Zone[] = ['head', 'body', 'legs', 'arms'];
  private static readonly DEFENSE_ZONES: Zone[] = ['head', 'body', 'legs', 'arms']; // Убрали 'back', так как визуально не отображается

  static generateActions(): RoundActions {
    // Принудительно фильтруем 'back' из исходных массивов на всякий случай
    const safeAttackZones = this.ATTACK_ZONES.filter(z => z !== 'back');
    const safeDefenseZones = this.DEFENSE_ZONES.filter(z => z !== 'back');

    const attacks = this.selectUniqueZones(safeAttackZones, 2);
    const defenses = this.selectUniqueZones(safeDefenseZones, 3);

    // Финальная валидация: проверяем, что выбрано ровно 2 атаки и 3 защиты
    if (attacks.length !== 2) {
      throw new Error(`Моб должен выбрать ровно 2 зоны атаки, выбрано: ${attacks.length}`);
    }
    if (defenses.length !== 3) {
      throw new Error(`Моб должен выбрать ровно 3 зоны защиты, выбрано: ${defenses.length}`);
    }

    // СТРОГАЯ проверка: проверяем, что нет 'back' в выбранных зонах
    const hasBackInAttacks = attacks.some(z => z === 'back' || String(z) === 'back');
    const hasBackInDefenses = defenses.some(z => z === 'back' || String(z) === 'back');
    if (hasBackInAttacks || hasBackInDefenses) {
      console.error('❌ ОШИБКА: Моб выбрал "back"!', { attacks, defenses });
      throw new Error(`Моб не может выбирать зону "back". Атаки: ${attacks.join(', ')}, Защиты: ${defenses.join(', ')}`);
    }

    // СТРОГАЯ проверка уникальности атак
    const attackSet = new Set(attacks);
    if (attackSet.size !== attacks.length) {
      console.error('❌ ОШИБКА: Дубликаты в атаках!', { attacks });
      throw new Error(`Обнаружены дубликаты в атаках моба: ${attacks.join(', ')}`);
    }

    // СТРОГАЯ проверка уникальности защит
    const defenseSet = new Set(defenses);
    if (defenseSet.size !== defenses.length) {
      console.error('❌ ОШИБКА: Дубликаты в защитах!', { defenses });
      throw new Error(`Обнаружены дубликаты в защитах моба: ${defenses.join(', ')}`);
    }

    // Проверяем, что все зоны из допустимого списка
    const validZones = ['head', 'body', 'legs', 'arms'];
    const invalidAttacks = attacks.filter(z => !validZones.includes(z as string));
    const invalidDefenses = defenses.filter(z => !validZones.includes(z as string));
    if (invalidAttacks.length > 0 || invalidDefenses.length > 0) {
      console.error('❌ ОШИБКА: Недопустимые зоны!', { invalidAttacks, invalidDefenses });
      throw new Error(`Моб выбрал недопустимые зоны. Атаки: ${invalidAttacks.join(', ')}, Защиты: ${invalidDefenses.join(', ')}`);
    }

    console.log('✅ Моб выбрал действия:', { attacks, defenses });

    return {
      attacks: attacks as [Zone, Zone],
      defenses: defenses as [Zone, Zone, Zone],
    };
  }

  /**
   * Выбирает уникальные зоны без повторений
   * Использует алгоритм Fisher-Yates для правильного перемешивания
   * @param zones - массив доступных зон
   * @param count - количество зон для выбора
   * @returns массив уникальных зон (ровно count штук)
   */
  private static selectUniqueZones(zones: Zone[], count: number): Zone[] {
    // ЖЕСТКО определяем валидные зоны - 'back' НЕ ДОЛЖЕН быть здесь НИКОГДА
    const VALID_ZONES_ONLY = ['head', 'body', 'legs', 'arms'] as const;
    type ValidZone = typeof VALID_ZONES_ONLY[number];
    
    // СТРОГАЯ фильтрация: оставляем ТОЛЬКО валидные зоны, исключаем 'back' полностью
    const availableZones = zones.filter(zone => {
      const isValid = VALID_ZONES_ONLY.includes(zone as typeof VALID_ZONES_ONLY[number]);
      if (zone === 'back') {
        console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: Обнаружен "back" в selectUniqueZones!', zones);
        return false; // Жестко исключаем 'back'
      }
      return isValid;
    });
    
    if (count > availableZones.length) {
      throw new Error(`Недостаточно зон: требуется ${count}, доступно ${availableZones.length} (после фильтрации 'back')`);
    }

    // Создаем копию массива
    const shuffled = [...availableZones];
    
    // Алгоритм Fisher-Yates для правильного перемешивания
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Возвращаем первые count уникальных зон
    const selected = shuffled.slice(0, count);
    
    // СТРОГАЯ проверка: убеждаемся, что 'back' не попал в результат
    if (selected.includes('back')) {
      console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: "back" попал в результат selectUniqueZones!', {
        input: zones,
        selected,
        availableZones
      });
      // Убираем 'back' и заменяем на валидную зону
      const filtered: ValidZone[] = selected.filter((z): z is ValidZone => z !== 'back');
      const missing = count - filtered.length;
      for (let i = 0; i < missing; i++) {
        const available = VALID_ZONES_ONLY.find(z => !filtered.includes(z));
        if (available) filtered.push(available);
      }
      return filtered.slice(0, count) as Zone[];
    }
    
    // Проверяем, что все зоны уникальны
    const uniqueSet = new Set(selected);
    if (uniqueSet.size !== selected.length) {
      throw new Error('Обнаружены дубликаты в выбранных зонах');
    }
    
    // Проверяем, что выбрано ровно count зон
    if (selected.length !== count) {
      throw new Error(`Выбрано ${selected.length} зон вместо ${count}`);
    }
    
    return selected;
  }
}
