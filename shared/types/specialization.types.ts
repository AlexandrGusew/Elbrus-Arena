import { SpecializationBranch } from './enums';

export interface Specialization {
  id: number;
  characterId: number;
  branch: SpecializationBranch;
  tier1Unlocked: boolean;
  tier2Unlocked: boolean;
  tier3Unlocked: boolean;
  selectedAt: string;
}

export interface SpecializationAbility {
  id: number;
  branch: SpecializationBranch;
  tier: number;
  name: string;
  description: string;
  cooldown: number;
  effects: Record<string, any>;
}

export interface GetAvailableBranchesResponse {
  branches: SpecializationBranch[];
}

export interface GetCharacterSpecializationResponse {
  specialization: Specialization | null;
}

export interface GetBranchAbilitiesResponse {
  abilities: SpecializationAbility[];
}

export interface ChooseBranchRequest {
  characterId: number;
  branch: SpecializationBranch;
}

export interface ChooseBranchResponse {
  specialization: Specialization;
}

export interface ChangeBranchRequest {
  characterId: number;
  newBranch: SpecializationBranch;
}

export interface ChangeBranchResponse {
  specialization: Specialization;
  message: string;
}

export interface UnlockTierRequest {
  characterId: number;
}

export interface UnlockTierResponse {
  specialization: Specialization;
  message: string;
}
