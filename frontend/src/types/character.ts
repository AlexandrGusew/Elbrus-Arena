/**
 * Типы для персонажей и классов
 */

/**
 * Классы персонажей
 */
export const CHARACTER_CLASSES = {
  WARRIOR: 'WARRIOR',
  ASSASSIN: 'ASSASSIN',
  MAGE: 'MAGE'
} as const

export type CharacterClass = (typeof CHARACTER_CLASSES)[keyof typeof CHARACTER_CLASSES]

/**
 * Информация о классе персонажа
 */
export interface ClassInfo {
  id: CharacterClass
  name: string
  emoji: string
  description: string
  stats: {
    hp: string
    damage: string
    special: string
  }
}

/**
 * Данные для создания персонажа
 */
export interface CreateCharacterRequest {
  name: string
  class: CharacterClass
}

/**
 * Персонаж (полные данные с backend)
 */
export interface Character {
  id: string
  userId: string
  name: string
  class: CharacterClass
  level: number
  experience: number
  hp: number
  maxHp: number
  gold: number
  stamina: number
  maxStamina: number
  createdAt: string
  updatedAt: string
}

/**
 * Конфигурация классов
 */
export const CLASS_CONFIG: Record<CharacterClass, ClassInfo> = {
  [CHARACTER_CLASSES.WARRIOR]: {
    id: CHARACTER_CLASSES.WARRIOR,
    name: 'Воин',
    emoji: '⚔️',
    description: 'Мощный воин с высоким запасом здоровья и сильными физическими атаками',
    stats: {
      hp: 'Высокий',
      damage: 'Средний',
      special: 'Может носить тяжелую броню'
    }
  },
  [CHARACTER_CLASSES.ASSASSIN]: {
    id: CHARACTER_CLASSES.ASSASSIN,
    name: 'Убийца',
    emoji: '🗡️',
    description: 'Быстрый и смертоносный убийца с критическими ударами',
    stats: {
      hp: 'Низкий',
      damage: 'Очень высокий',
      special: 'Шанс критического удара'
    }
  },
  [CHARACTER_CLASSES.MAGE]: {
    id: CHARACTER_CLASSES.MAGE,
    name: 'Маг',
    emoji: '🔮',
    description: 'Владеет магией стихий и может атаковать несколько целей',
    stats: {
      hp: 'Средний',
      damage: 'Магический',
      special: 'AoE атаки (несколько зон)'
    }
  }
}
