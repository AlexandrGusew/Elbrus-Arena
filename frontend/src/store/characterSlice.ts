/**
 * Redux Slice для управления состоянием персонажа
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Character, CreateCharacterRequest } from '../types/character'
import { characterService } from '../services/character.service'

/**
 * Состояние персонажа в Redux
 */
interface CharacterState {
  character: Character | null
  loading: boolean
  error: string | null
}

/**
 * Начальное состояние
 */
const initialState: CharacterState = {
  character: null,
  loading: false,
  error: null
}

/**
 * ASYNC THUNK: Создание персонажа
 *
 * @example
 * ```ts
 * dispatch(createCharacter({ name: 'Артур', class: 'WARRIOR' }))
 * ```
 */
export const createCharacter = createAsyncThunk(
  'character/create',
  async (data: CreateCharacterRequest, { rejectWithValue }) => {
    try {
      const character = await characterService.createCharacter(data)
      return character
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка создания персонажа'
      )
    }
  }
)

/**
 * ASYNC THUNK: Получение данных персонажа
 *
 * @example
 * ```ts
 * dispatch(fetchMyCharacter())
 * ```
 */
export const fetchMyCharacter = createAsyncThunk(
  'character/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const character = await characterService.getMyCharacter()
      if (!character) {
        return rejectWithValue('Персонаж не найден')
      }
      return character
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка получения персонажа'
      )
    }
  }
)

/**
 * Character Slice
 */
const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {
    /**
     * Очистка ошибки
     */
    clearError: (state) => {
      state.error = null
    },

    /**
     * Установка персонажа вручную
     */
    setCharacter: (state, action: PayloadAction<Character>) => {
      state.character = action.payload
      state.error = null
    },

    /**
     * Очистка данных персонажа
     */
    clearCharacter: (state) => {
      state.character = null
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // ==========================================
    // createCharacter
    // ==========================================
    builder.addCase(createCharacter.pending, (state) => {
      state.loading = true
      state.error = null
      console.log('⏳ Создание персонажа...')
    })

    builder.addCase(createCharacter.fulfilled, (state, action) => {
      state.loading = false
      state.character = action.payload
      state.error = null
      console.log('✅ Персонаж создан:', action.payload.name)
    })

    builder.addCase(createCharacter.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
      console.error('❌ Ошибка создания персонажа:', action.payload)
    })

    // ==========================================
    // fetchMyCharacter
    // ==========================================
    builder.addCase(fetchMyCharacter.pending, (state) => {
      state.loading = true
      state.error = null
      console.log('⏳ Загрузка персонажа...')
    })

    builder.addCase(fetchMyCharacter.fulfilled, (state, action) => {
      state.loading = false
      state.character = action.payload
      state.error = null
      console.log('✅ Персонаж загружен:', action.payload.name)
    })

    builder.addCase(fetchMyCharacter.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
      console.log('ℹ️ Персонаж не найден')
    })
  }
})

/**
 * Экспортируем actions
 */
export const { clearError, setCharacter, clearCharacter } =
  characterSlice.actions

/**
 * Экспортируем reducer
 */
export default characterSlice.reducer
