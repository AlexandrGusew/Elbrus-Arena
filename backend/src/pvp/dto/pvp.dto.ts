import { IsNumber } from 'class-validator';
import type { Zone } from '../../../../shared/types/battle.types';

export class JoinQueueDto {
  @IsNumber()
  characterId: number;
}

export class PvpActionsDto {
  attacks: [Zone, Zone];
  defenses: [Zone, Zone, Zone];
}
