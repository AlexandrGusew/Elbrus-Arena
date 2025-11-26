import { baseApi } from './baseApi';
import type {
  GetAvailableBranchesResponse,
  GetCharacterSpecializationResponse,
  GetBranchAbilitiesResponse,
  ChooseBranchRequest,
  ChooseBranchResponse,
  ChangeBranchRequest,
  ChangeBranchResponse,
  UnlockTierRequest,
  UnlockTierResponse,
  SpecializationBranch,
} from '../../../../shared/types';

export const specializationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAvailableBranches: builder.query<GetAvailableBranchesResponse, string>({
      query: (characterClass) => `/specializations/${characterClass}/branches`,
    }),

    getCharacterSpecialization: builder.query<GetCharacterSpecializationResponse, number>({
      query: (characterId) => `/specializations/character/${characterId}`,
      providesTags: ['Character'],
    }),

    getBranchAbilities: builder.query<GetBranchAbilitiesResponse, SpecializationBranch>({
      query: (branch) => `/specializations/branch/${branch}/abilities`,
    }),

    chooseBranch: builder.mutation<ChooseBranchResponse, ChooseBranchRequest>({
      query: (body) => ({
        url: '/specializations/choose',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Character'],
    }),

    changeBranch: builder.mutation<ChangeBranchResponse, ChangeBranchRequest>({
      query: (body) => ({
        url: '/specializations/change',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Character'],
    }),

    unlockTier: builder.mutation<UnlockTierResponse, UnlockTierRequest>({
      query: (body) => ({
        url: '/specializations/unlock-tier',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Character'],
    }),
  }),
});

export const {
  useGetAvailableBranchesQuery,
  useGetCharacterSpecializationQuery,
  useGetBranchAbilitiesQuery,
  useChooseBranchMutation,
  useChangeBranchMutation,
  useUnlockTierMutation,
} = specializationApi;
