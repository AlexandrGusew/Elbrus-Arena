import { Prisma } from '@prisma/client';

export const CHARACTER_INCLUDE = {
  inventory: {
    include: {
      items: {
        include: {
          item: true,
        },
      },
    },
  },
} satisfies Prisma.CharacterInclude;

export const CLASS_STATS = {
  warrior: {
    strength: 15,
    agility: 8,
    intelligence: 5,
    maxHp: 150,
    currentHp: 150,
  },
  mage: {
    strength: 5,
    agility: 8,
    intelligence: 15,
    maxHp: 100,
    currentHp: 100,
  },
  samurai: {
    strength: 12,
    agility: 12,
    intelligence: 6,
    maxHp: 130,
    currentHp: 130,
  },
} as const;
