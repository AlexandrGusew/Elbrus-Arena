import { baseApi } from './baseApi'
import type { DungeonWithMonsters } from '../../../../shared/types/dungeon.types'

interface StartBattleRequest {
  characterId: number
  dungeonId: number
}

interface StartBattleResponse {
  id: string
}

export const battleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDungeons: builder.query<DungeonWithMonsters[], void>({
      query: () => '/dungeons',
    }),

    startBattle: builder.mutation<StartBattleResponse, StartBattleRequest>({
      query: (data) => ({
        url: '/battle/start',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Battle', 'Character'],
    }),
  }),
})

export const {
  useGetDungeonsQuery,
  useStartBattleMutation,
} = battleApi