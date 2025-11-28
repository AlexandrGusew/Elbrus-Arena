import { describe, it, expect } from 'vitest';
import { store } from './index';
import { baseApi } from './api/baseApi';

describe('Redux Store', () => {
  it('должен быть создан с правильной конфигурацией', () => {
    expect(store).toBeDefined();
    expect(store.getState()).toBeDefined();
  });

  it('должен содержать baseApi reducer', () => {
    const state = store.getState();
    expect(state).toHaveProperty(baseApi.reducerPath);
  });

  it('должен иметь правильный тип RootState', () => {
    const state = store.getState();
    expect(state).toHaveProperty('api');
  });

  it('должен поддерживать dispatch', () => {
    expect(store.dispatch).toBeDefined();
    expect(typeof store.dispatch).toBe('function');
  });
});