import { describe, it, expect, beforeEach } from 'vitest';
import { characterApi } from './characterApi';

describe('CharacterApi', () => {
  describe('Endpoints', () => {
    it('должен иметь endpoint getCharacter', () => {
      expect(characterApi.endpoints.getCharacter).toBeDefined();
    });

    it('должен иметь endpoint getCharacterByName', () => {
      expect(characterApi.endpoints.getCharacterByName).toBeDefined();
    });

    it('должен иметь endpoint createCharacter', () => {
      expect(characterApi.endpoints.createCharacter).toBeDefined();
    });

    it('должен иметь endpoint equipItem', () => {
      expect(characterApi.endpoints.equipItem).toBeDefined();
    });

    it('должен иметь endpoint unequipItem', () => {
      expect(characterApi.endpoints.unequipItem).toBeDefined();
    });

    it('должен иметь endpoint enhanceItem', () => {
      expect(characterApi.endpoints.enhanceItem).toBeDefined();
    });

    it('должен иметь endpoint sellItem', () => {
      expect(characterApi.endpoints.sellItem).toBeDefined();
    });

    it('должен иметь endpoint getLevelProgress', () => {
      expect(characterApi.endpoints.getLevelProgress).toBeDefined();
    });

    it('должен иметь endpoint distributeStats', () => {
      expect(characterApi.endpoints.distributeStats).toBeDefined();
    });

    it('должен иметь endpoint getStaminaInfo', () => {
      expect(characterApi.endpoints.getStaminaInfo).toBeDefined();
    });
  });

  describe('Hooks', () => {
    it('должен экспортировать useGetCharacterQuery', () => {
      expect(characterApi.useGetCharacterQuery).toBeDefined();
    });

    it('должен экспортировать useGetCharacterByNameQuery', () => {
      expect(characterApi.useGetCharacterByNameQuery).toBeDefined();
    });

    it('должен экспортировать useCreateCharacterMutation', () => {
      expect(characterApi.useCreateCharacterMutation).toBeDefined();
    });

    it('должен экспортировать useEquipItemMutation', () => {
      expect(characterApi.useEquipItemMutation).toBeDefined();
    });

    it('должен экспортировать useUnequipItemMutation', () => {
      expect(characterApi.useUnequipItemMutation).toBeDefined();
    });

    it('должен экспортировать useEnhanceItemMutation', () => {
      expect(characterApi.useEnhanceItemMutation).toBeDefined();
    });

    it('должен экспортировать useSellItemMutation', () => {
      expect(characterApi.useSellItemMutation).toBeDefined();
    });

    it('должен экспортировать useGetLevelProgressQuery', () => {
      expect(characterApi.useGetLevelProgressQuery).toBeDefined();
    });

    it('должен экспортировать useDistributeStatsMutation', () => {
      expect(characterApi.useDistributeStatsMutation).toBeDefined();
    });

    it('должен экспортировать useGetStaminaInfoQuery', () => {
      expect(characterApi.useGetStaminaInfoQuery).toBeDefined();
    });
  });

  describe('Query Configuration', () => {
    it('getCharacter должен иметь правильную конфигурацию', () => {
      const endpoint = characterApi.endpoints.getCharacter;
      expect(endpoint.name).toBe('getCharacter');
    });

    it('getCharacterByName должен иметь правильную конфигурацию', () => {
      const endpoint = characterApi.endpoints.getCharacterByName;
      expect(endpoint.name).toBe('getCharacterByName');
    });
  });

  describe('Mutation Configuration', () => {
    it('createCharacter должен быть мутацией', () => {
      const endpoint = characterApi.endpoints.createCharacter;
      expect(endpoint.name).toBe('createCharacter');
    });

    it('equipItem должен быть мутацией', () => {
      const endpoint = characterApi.endpoints.equipItem;
      expect(endpoint.name).toBe('equipItem');
    });

    it('enhanceItem должен быть мутацией', () => {
      const endpoint = characterApi.endpoints.enhanceItem;
      expect(endpoint.name).toBe('enhanceItem');
    });

    it('sellItem должен быть мутацией', () => {
      const endpoint = characterApi.endpoints.sellItem;
      expect(endpoint.name).toBe('sellItem');
    });

    it('distributeStats должен быть мутацией', () => {
      const endpoint = characterApi.endpoints.distributeStats;
      expect(endpoint.name).toBe('distributeStats');
    });
  });
});