import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CharacterStaminaService {
  private readonly MAX_STAMINA = 100;
  private readonly STAMINA_REGEN_PER_SECOND = 1;

  constructor(private prisma: PrismaService) {}

  /**
   * Вычисляет текущую стамину персонажа на основе последнего сохраненного значения
   * Регенерирует 1 стамину в секунду до максимума 100
   */
  private calculateCurrentStamina(
    savedStamina: number,
    lastUpdateTime: Date,
  ): number {
    const now = new Date();
    const secondsPassed = Math.floor(
      (now.getTime() - lastUpdateTime.getTime()) / 1000,
    );
    const regenerated = secondsPassed * this.STAMINA_REGEN_PER_SECOND;
    const currentStamina = Math.min(
      this.MAX_STAMINA,
      savedStamina + regenerated,
    );

    return currentStamina;
  }

  /**
   * Получает информацию о текущей стамине персонажа
   * Автоматически обновляет стамину в БД если прошло время
   */
  async getStaminaInfo(characterId: number): Promise<{
    currentStamina: number;
    maxStamina: number;
    secondsToFull: number;
  }> {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      throw new Error('Character not found');
    }

    const currentStamina = this.calculateCurrentStamina(
      character.stamina,
      character.lastStaminaUpdate,
    );

    // Обновляем стамину в БД если она изменилась
    if (currentStamina !== character.stamina) {
      await this.prisma.character.update({
        where: { id: characterId },
        data: {
          stamina: currentStamina,
          lastStaminaUpdate: new Date(),
        },
      });
    }

    const secondsToFull =
      currentStamina < this.MAX_STAMINA
        ? (this.MAX_STAMINA - currentStamina) / this.STAMINA_REGEN_PER_SECOND
        : 0;

    return {
      currentStamina,
      maxStamina: this.MAX_STAMINA,
      secondsToFull,
    };
  }

  /**
   * Тратит стамину для входа в подземелье
   * Выбрасывает исключение если недостаточно стамины
   */
  async spendStamina(characterId: number, amount: number): Promise<void> {
    const { currentStamina } = await this.getStaminaInfo(characterId);

    if (currentStamina < amount) {
      throw new BadRequestException(
        `Недостаточно стамины. Требуется: ${amount}, доступно: ${currentStamina}`,
      );
    }

    await this.prisma.character.update({
      where: { id: characterId },
      data: {
        stamina: currentStamina - amount,
        lastStaminaUpdate: new Date(),
      },
    });
  }

  /**
   * Восстанавливает стамину персонажа до максимума (для админ-команд)
   */
  async restoreStamina(characterId: number): Promise<void> {
    await this.prisma.character.update({
      where: { id: characterId },
      data: {
        stamina: this.MAX_STAMINA,
        lastStaminaUpdate: new Date(),
      },
    });
  }
}