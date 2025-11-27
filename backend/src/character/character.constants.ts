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
  specialization: true,
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
  rogue: {
    strength: 10,
    agility: 15,
    intelligence: 8,
    maxHp: 120,
    currentHp: 120,
  },
} as const;
