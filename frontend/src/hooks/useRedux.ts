/**
 * Типизированные хуки для Redux
 *
 * Вместо обычных useDispatch и useSelector используем эти хуки
 * для автоматического определения типов
 */

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from '../store'

/**
 * Типизированный useDispatch
 *
 * @example
 * ```ts
 * import { useAppDispatch } from './hooks/useRedux'
 *
 * const dispatch = useAppDispatch()
 * dispatch(loginWithTelegram(initData))
 * ```
 */
export const useAppDispatch = () => useDispatch<AppDispatch>()

/**
 * Типизированный useSelector
 *
 * @example
 * ```ts
 * import { useAppSelector } from './hooks/useRedux'
 *
 * const { isAuthenticated, user } = useAppSelector(state => state.auth)
 * ```
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
