import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CharacterLevelUpService {
  constructor(private prisma: PrismaService) {}

  /**
   * Рассчитывает требуемый опыт для следующего уровня
   * Формула: 100 * level^2
   */
  calculateRequiredExp(level: number): number {
    return 100 * level * level;
  }

  /**
   * Проверяет и автоматически повышает уровень персонажа
   * Может повысить несколько уровней за раз
   * @returns количество полученных уровней
   */
  async checkAndLevelUp(characterId: number): Promise<number> {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      throw new Error('Character not found');
    }

    let currentLevel = character.level;
    let currentExp = character.experience;
    let currentFreePoints = character.freePoints;
    let currentSuperPoints = character.superPoints;
    let levelsGained = 0;

    // Повышаем уровень пока хватает опыта
    while (true) {
      const requiredExp = this.calculateRequiredExp(currentLevel);

      if (currentExp < requiredExp) {
        break; // Недостаточно опыта для следующего уровня
      }

      // Повышаем уровень
      currentLevel++;
      currentFreePoints += 3; // 3 свободных очка за уровень

      // Начисление superPoints каждые 5 уровней после 15-го
      // Уровни: 20, 25, 30, 35, 40...
      if (currentLevel >= 20 && (currentLevel - 15) % 5 === 0) {
        currentSuperPoints += 1;
      }

      levelsGained++;
    }

    // Если был левел-ап, обновляем персонажа
    if (levelsGained > 0) {
      await this.prisma.character.update({
        where: { id: characterId },
        data: {
          level: currentLevel,
          freePoints: currentFreePoints,
          superPoints: currentSuperPoints,
        },
      });
    }

    return levelsGained;
  }

  /**
   * Распределяет свободные очки характеристик
   */
  async distributeStats(
    characterId: number,
    strength: number,
    agility: number,
    intelligence: number,
    maxHp?: number,
    stamina?: number,
  ): Promise<void> {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      throw new Error('Character not found');
    }

    // Используем 0 если параметры не переданы (для обратной совместимости)
    const hpPoints = maxHp ?? 0;
    const staminaPoints = stamina ?? 0;

    const totalPoints = strength + agility + intelligence + hpPoints + staminaPoints;

    if (totalPoints > character.freePoints) {
      throw new Error('Not enough free points');
    }

    if (strength < 0 || agility < 0 || intelligence < 0 || hpPoints < 0 || staminaPoints < 0) {
      throw new Error('Stat points cannot be negative');
    }

    // Рассчитываем новые значения
    // HP: +10 HP за очко
    // Stamina: +5 Stamina за очко
    const hpIncrease = hpPoints * 10;
    const staminaIncrease = staminaPoints * 5;

    await this.prisma.character.update({
      where: { id: characterId },
      data: {
        strength: character.strength + strength,
        agility: character.agility + agility,
        intelligence: character.intelligence + intelligence,
        maxHp: character.maxHp + hpIncrease,
        stamina: character.stamina + staminaIncrease,
        freePoints: character.freePoints - totalPoints,
      },
    });
  }

  /**
   * Получить информацию о прогрессе уровня
   */
  async getLevelProgress(characterId: number): Promise<{
    currentLevel: number;
    currentExp: number;
    requiredExp: number;
    progress: number; // процент от 0 до 100
    freePoints: number;
  }> {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      throw new Error('Character not found');
    }

    const requiredExp = this.calculateRequiredExp(character.level);
    const progress = Math.min(100, (character.experience / requiredExp) * 100);

    return {
      currentLevel: character.level,
      currentExp: character.experience,
      requiredExp,
      progress,
      freePoints: character.freePoints,
    };
  }

  /**
   * ТЕСТОВЫЙ МЕТОД: Дает персонажу +20000 опыта для быстрого тестирования
   */
  async testLevelBoost(characterId: number): Promise<{
    message: string;
    oldLevel: number;
    newLevel: number;
    expGained: number;
  }> {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      throw new Error('Character not found');
    }

    const oldLevel = character.level;
    const expBoost = 20000;

    // Добавляем опыт
    await this.prisma.character.update({
      where: { id: characterId },
      data: {
        experience: character.experience + expBoost,
      },
    });

    // Автоматически повышаем уровни
    const levelsGained = await this.checkAndLevelUp(characterId);

    return {
      message: `Получено ${expBoost} опыта! Уровень: ${oldLevel} → ${oldLevel + levelsGained}`,
      oldLevel,
      newLevel: oldLevel + levelsGained,
      expGained: expBoost,
    };
  }
}