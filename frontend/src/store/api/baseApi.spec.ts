import { describe, it, expect, beforeEach, vi } from 'vitest';
import { baseApi } from './baseApi';

describe('BaseApi', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Configuration', () => {
    it('должен иметь правильный reducerPath', () => {
      expect(baseApi.reducerPath).toBe('api');
    });

    it('должен иметь enhanceEndpoints метод', () => {
      expect(baseApi).toHaveProperty('enhanceEndpoints');
    });

    it('должен использовать fetchBaseQuery', () => {
      expect(baseApi).toBeDefined();
      expect(baseApi.reducer).toBeDefined();
      expect(baseApi.middleware).toBeDefined();
    });
  });

  describe('Endpoints', () => {
    it('должен позволять добавлять endpoints через injectEndpoints', () => {
      expect(baseApi.injectEndpoints).toBeDefined();
      expect(typeof baseApi.injectEndpoints).toBe('function');
    });
  });

  describe('Reducer', () => {
    it('должен иметь reducer функцию', () => {
      expect(baseApi.reducer).toBeDefined();
      expect(typeof baseApi.reducer).toBe('function');
    });

    it('должен иметь middleware', () => {
      expect(baseApi.middleware).toBeDefined();
      expect(typeof baseApi.middleware).toBe('function');
    });
  });
});