/**
 * Dark Fantasy Design System Styles для Dashboard
 * Основано на дизайн-системе из Figma
 */

export const dashboardColors = {
  // Основные фоны (холодные тёмные оттенки, почти камень)
  backgroundDark: '#0B0B0D',        // почти чёрный (глобальный фон)
  backgroundMedium: '#1A1A1F',      // графитовый фон панелей
  backgroundLight: '#232328',        // фон инвентаря/контейнеров
  backgroundContrast: '#2E2E33',    // лёгкий контраст для блоков
  
  // Рамки / разделители / декоративный металл (старое золото и бронза)
  borderGold: '#C9A86A',            // PoE-золото (кнопки, рамки, заголовки)
  borderBronze: '#A07938',          // темнее, бронза
  borderMetal: '#6B542E',            // старый металл
  borderShadow: '#4B3C24',          // глубина/тени под рамками
  
  // Кнопки (Button UI)
  buttonBackground: '#1A1A1F',      // фон кнопки
  buttonHover: '#2C2C32',           // ховер кнопки
  buttonBorder: '#C9A86A',          // активная рамка
  buttonGlow: '#8F6B31',            // внутреннее свечение (очень слабое)
  
  // Текст
  textGold: '#E4D3A5',              // "золотой текст", ключевые надписи
  textPrimary: '#FFFFFF',           // системный текст
  textSecondary: '#B8B8B8',         // вторичный текст
  textMuted: '#757575',             // неактивные элементы
  
  // Градиенты
  gradientGold: 'linear-gradient(to bottom, #E4D3A5 0%, #C9A86A 50%, #A07938 100%)',
  gradientBackground: 'linear-gradient(to bottom, #1A1A1F 0%, #0B0B0D 100%)',
  gradientCard: 'linear-gradient(to bottom, #232328 0%, #1A1A1F 100%)',
  gradientButton: 'linear-gradient(to bottom, #2C2C32 0%, #1A1A1F 100%)',
} as const;

export const dashboardFonts = {
  primary: "'Cinzel', 'MedievalSharp', 'UnifrakturMaguntia', 'IM Fell English', serif",
  secondary: "'IM Fell English', serif",
} as const;

export const dashboardEffects = {
  textShadow: '0 0 10px rgba(201, 168, 106, 0.4)',
  textShadowStrong: '0 0 15px rgba(201, 168, 106, 0.6)',
  boxShadow: '0 0 30px rgba(0, 0, 0, 0.9)',
  boxShadowGold: '0 0 15px rgba(201, 168, 106, 0.3)',
  boxShadowGlow: '0 0 10px rgba(143, 107, 49, 0.2)',
  insetShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.9)',
} as const;

export const dashboardBorders = {
  cornerSize: '12px',
  cornerBorder: '3px',
  mainBorder: '3px',
  secondaryBorder: '2px',
} as const;

/**
 * Стили для декоративных уголков
 */
export const cornerOrnaments = {
  topLeft: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: dashboardBorders.cornerSize,
    height: dashboardBorders.cornerSize,
    borderTop: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderGold}`,
    borderLeft: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderGold}`,
  },
  topRight: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    width: dashboardBorders.cornerSize,
    height: dashboardBorders.cornerSize,
    borderTop: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderGold}`,
    borderRight: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderGold}`,
  },
  bottomLeft: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    width: dashboardBorders.cornerSize,
    height: dashboardBorders.cornerSize,
    borderBottom: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderGold}`,
    borderLeft: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderGold}`,
  },
  bottomRight: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    width: dashboardBorders.cornerSize,
    height: dashboardBorders.cornerSize,
    borderBottom: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderGold}`,
    borderRight: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderGold}`,
  },
};

/**
 * Стили для основного контейнера
 */
export const mainContainer = {
  border: `${dashboardBorders.mainBorder} solid ${dashboardColors.borderGold}`,
  borderRadius: '16px',
  background: dashboardColors.gradientBackground,
  backdropFilter: 'blur(12px)',
  boxShadow: dashboardEffects.boxShadow,
  padding: '24px',
  position: 'relative' as const,
  overflow: 'hidden' as const,
};

/**
 * Стили для карточек
 */
export const cardStyle = {
  border: `${dashboardBorders.secondaryBorder} solid ${dashboardColors.borderGold}`,
  borderRadius: '12px',
  background: dashboardColors.gradientCard,
  padding: '20px',
  position: 'relative' as const,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.7)',
  overflow: 'hidden' as const,
};

/**
 * Стили для кнопок
 */
export const buttonStyle = {
  border: `${dashboardBorders.mainBorder} solid ${dashboardColors.borderGold}`,
  borderRadius: '12px',
  background: dashboardColors.buttonBackground,
  padding: '12px 24px',
  position: 'relative' as const,
  cursor: 'pointer' as const,
  transition: 'all 0.3s ease',
  fontFamily: dashboardFonts.primary,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.2em',
  color: dashboardColors.textGold,
  textShadow: dashboardEffects.textShadow,
  overflow: 'hidden' as const,
};

/**
 * Стили для текста с градиентом
 */
export const gradientTextStyle = {
  fontFamily: dashboardFonts.primary,
  textShadow: dashboardEffects.textShadow,
  background: dashboardColors.gradientGold,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

/**
 * Стили для статистики
 */
export const statBlockStyle = {
  border: `1px solid ${dashboardColors.borderMetal}`,
  borderRadius: '8px',
  background: dashboardColors.backgroundDark,
  padding: '10px 12px',
  minHeight: '40px',
};

