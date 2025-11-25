import { CSSProperties } from 'react';

// Цветовая палитра
export const colors = {
  primary: '#8b2c2f',
  primaryDark: '#2a1a1a',

  backgroundDark: '#1a1a1a',
  backgroundMedium: '#2a2a2a',
  backgroundLight: '#333',
  backgroundGray: '#4a4a4a',

  text: '#eae6dd',
  textGray: '#aaa',
  textMuted: '#888',

  error: '#ff4444',
  errorBackground: '#331111',

  success: '#4caf50',
  warning: '#ff9800',

  border: '#444',
  borderTransparent: 'transparent',
} as const;

// Общие компоненты стилей
export const commonStyles: Record<string, CSSProperties> = {
  // Контейнеры
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  containerNarrow: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },

  // Карточки
  card: {
    background: colors.backgroundDark,
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  cardMedium: {
    background: colors.backgroundMedium,
    padding: '15px',
    borderRadius: '8px',
  },

  // Гриды
  gridTwoColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  gridItems: {
    display: 'grid',
    gap: '10px',
    marginTop: '10px',
  },

  // Инвентарь
  inventoryEmpty: {
    color: colors.textMuted,
    textAlign: 'center',
    padding: '30px',
  },
  inventoryItem: {
    background: colors.backgroundMedium,
    padding: '15px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid transparent',
  },
  inventoryItemEquipped: {
    background: colors.primaryDark,
    padding: '15px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: `2px solid ${colors.primary}`,
  },

  // Текст
  itemName: {
    fontWeight: 'bold',
  },
  itemStats: {
    fontSize: '14px',
    color: colors.textGray,
  },

  // Кнопки
  button: {
    width: '100%',
    padding: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: colors.text,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  buttonPrimary: {
    background: colors.primary,
  },
  buttonSecondary: {
    background: colors.backgroundGray,
  },
  buttonDisabled: {
    background: '#555',
    cursor: 'not-allowed',
  },

  // Состояния загрузки и ошибок
  loadingContainer: {
    padding: '20px',
    textAlign: 'center',
  },
  errorContainer: {
    padding: '20px',
    color: colors.error,
  },
  errorMessage: {
    color: colors.error,
    marginBottom: '15px',
    padding: '10px',
    background: colors.errorBackground,
    borderRadius: '4px',
  },

  // Формы
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: `1px solid ${colors.border}`,
    background: colors.backgroundDark,
    color: '#fff',
  },
};

// Хелпер для объединения стилей
export const mergeStyles = (...styles: (CSSProperties | undefined)[]): CSSProperties => {
  return Object.assign({}, ...styles.filter(Boolean));
};
