import { baseApi } from './baseApi'
import type { Character, CreateCharacterDto } from '../../../../shared/types/character.types'

export const characterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCharacter: builder.query<Character, number>({
      query: (id) => `/character/${id}`,
      providesTags: (result, error, id) => [{ type: 'Character', id }],
    }),

    getMyCharacter: builder.query<Character | null, void>({
      query: () => `/character/me`,
      providesTags: (result) => result ? [{ type: 'Character', id: result.id }] : [],
    }),

    getCharacterByName: builder.query<Character | null, string>({
      query: (name) => `/character/name/${name}`,
      providesTags: (result) => result ? [{ type: 'Character', id: result.id }] : [],
    }),

    createCharacter: builder.mutation<Character, CreateCharacterDto>({
      query: (dto) => ({
        url: '/character',
        method: 'POST',
        body: dto,
      }),
      invalidatesTags: ['Character'],
    }),

    equipItem: builder.mutation<Character, { characterId: number; itemId: number }>({
      query: ({ characterId, itemId }) => ({
        url: `/character/${characterId}/equip/${itemId}`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, { characterId }) => [
        { type: 'Character', id: characterId },
      ],
    }),

    unequipItem: builder.mutation<Character, { characterId: number; itemId: number }>({
      query: ({ characterId, itemId }) => ({
        url: `/character/${characterId}/unequip/${itemId}`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, { characterId }) => [
        { type: 'Character', id: characterId },
      ],
    }),

    enhanceItem: builder.mutation<
      { success: boolean; newEnhancement: number; cost: number },
      { characterId: number; itemId: number }
    >({
      query: ({ characterId, itemId }) => ({
        url: `/character/${characterId}/enhance/${itemId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { characterId }) => [
        { type: 'Character', id: characterId },
      ],
    }),

    sellItem: builder.mutation<
      { goldReceived: number; itemName: string },
      { characterId: number; itemId: number }
    >({
      query: ({ characterId, itemId }) => ({
        url: `/character/${characterId}/sell/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { characterId }) => [
        { type: 'Character', id: characterId },
      ],
    }),

    getLevelProgress: builder.query<
      { currentLevel: number; currentExp: number; expForNextLevel: number; freePoints: number },
      number
    >({
      query: (characterId) => `/character/${characterId}/level-progress`,
    }),

    distributeStats: builder.mutation<
      void,
      { characterId: number; strength: number; agility: number; intelligence: number }
    >({
      query: ({ characterId, ...stats }) => ({
        url: `/character/${characterId}/distribute-stats`,
        method: 'POST',
        body: stats,
      }),
      invalidatesTags: (result, error, { characterId }) => [
        { type: 'Character', id: characterId },
      ],
    }),

    getStaminaInfo: builder.query<
      { currentStamina: number; maxStamina: number; regenRate: number; lastUpdate: string },
      number
    >({
      query: (characterId) => `/character/${characterId}/stamina`,
    }),

    testLevelBoost: builder.mutation<
      { message: string; oldLevel: number; newLevel: number; expGained: number },
      number
    >({
      query: (characterId) => ({
        url: `/character/${characterId}/test-level-boost`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, characterId) => [
        { type: 'Character', id: characterId },
      ],
    }),

    enhanceOffhand: builder.mutation<
      {
        newEnhancementLevel: number;
        itemName: string;
        bonusType: string;
        bonusValue: number;
      },
      number
    >({
      query: (characterId) => ({
        url: `/character/${characterId}/enhance-offhand`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, characterId) => [
        { type: 'Character', id: characterId },
      ],
    }),
  }),
})

export const {
  useGetCharacterQuery,
  useGetMyCharacterQuery,
  useLazyGetMyCharacterQuery,
  useGetCharacterByNameQuery,
  useCreateCharacterMutation,
  useEquipItemMutation,
  useUnequipItemMutation,
  useEnhanceItemMutation,
  useSellItemMutation,
  useGetLevelProgressQuery,
  useDistributeStatsMutation,
  useGetStaminaInfoQuery,
  useTestLevelBoostMutation,
  useEnhanceOffhandMutation,
} = characterApi