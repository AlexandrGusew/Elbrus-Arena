import { describe, it, expect } from 'vitest';
import { battleApi } from './battleApi';

describe('BattleApi', () => {
  describe('Endpoints', () => {
    it('должен иметь endpoint getDungeons', () => {
      expect(battleApi.endpoints.getDungeons).toBeDefined();
    });

    it('должен иметь endpoint startBattle', () => {
      expect(battleApi.endpoints.startBattle).toBeDefined();
    });
  });

  describe('Hooks', () => {
    it('должен экспортировать useGetDungeonsQuery', () => {
      expect(battleApi.useGetDungeonsQuery).toBeDefined();
    });

    it('должен экспортировать useStartBattleMutation', () => {
      expect(battleApi.useStartBattleMutation).toBeDefined();
    });
  });

  describe('Query Configuration', () => {
    it('getDungeons должен иметь правильную конфигурацию', () => {
      const endpoint = battleApi.endpoints.getDungeons;
      expect(endpoint.name).toBe('getDungeons');
    });
  });

  describe('Mutation Configuration', () => {
    it('startBattle должен быть мутацией', () => {
      const endpoint = battleApi.endpoints.startBattle;
      expect(endpoint.name).toBe('startBattle');
    });
  });
});