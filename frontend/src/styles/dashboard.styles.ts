/**
 * Dark Fantasy Design System Styles для Dashboard
 * Основано на дизайн-системе из Figma
 */

export const dashboardColors = {
  // Основные цвета
  backgroundDark: 'rgba(10, 10, 10, 0.95)',
  backgroundMedium: 'rgba(20, 20, 20, 0.9)',
  backgroundLight: 'rgba(30, 30, 30, 0.8)',
  
  // Акцентные цвета - кроваво-красный
  bloodRed: '#8b0000',
  bloodRedLight: '#dc143c',
  bloodRedDark: '#5a0000',
  crimson: '#dc143c',
  darkRed: '#8b0000',
  
  // Границы
  borderRed: 'rgba(139, 0, 0, 0.8)',
  borderRedHover: 'rgba(220, 20, 60, 0.9)',
  borderRedLight: 'rgba(220, 20, 60, 0.6)',
  borderAmber: 'rgba(139, 69, 19, 0.8)',
  
  // Текст
  textRed: '#dc143c',
  textRedLight: '#ff4d6d',
  textLight: 'rgba(255, 255, 255, 0.9)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  
  // Градиенты
  gradientRed: 'linear-gradient(to bottom, #ff6b6b 0%, #dc143c 50%, #8b0000 100%)',
  gradientBackground: 'linear-gradient(to bottom, rgba(20, 20, 20, 0.95) 0%, rgba(0, 0, 0, 0.95) 100%)',
  gradientCard: 'linear-gradient(to bottom, rgba(30, 30, 30, 0.9) 0%, rgba(10, 10, 10, 0.9) 100%)',
} as const;

export const dashboardFonts = {
  primary: "'Cinzel', 'MedievalSharp', 'UnifrakturMaguntia', 'IM Fell English', serif",
  secondary: "'IM Fell English', serif",
} as const;

export const dashboardEffects = {
  textShadow: '0 0 15px rgba(220, 20, 60, 0.6)',
  textShadowStrong: '0 0 20px rgba(220, 20, 60, 0.8)',
  boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)',
  boxShadowRed: '0 0 20px rgba(220, 20, 60, 0.3)',
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
    borderTop: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderRed}`,
    borderLeft: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderRed}`,
  },
  topRight: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    width: dashboardBorders.cornerSize,
    height: dashboardBorders.cornerSize,
    borderTop: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderRed}`,
    borderRight: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderRed}`,
  },
  bottomLeft: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    width: dashboardBorders.cornerSize,
    height: dashboardBorders.cornerSize,
    borderBottom: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderRed}`,
    borderLeft: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderRed}`,
  },
  bottomRight: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    width: dashboardBorders.cornerSize,
    height: dashboardBorders.cornerSize,
    borderBottom: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderRed}`,
    borderRight: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderRed}`,
  },
};

/**
 * Стили для основного контейнера
 */
export const mainContainer = {
  border: `${dashboardBorders.mainBorder} solid ${dashboardColors.borderRed}`,
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
  border: `${dashboardBorders.secondaryBorder} solid ${dashboardColors.borderRed}`,
  borderRadius: '12px',
  background: dashboardColors.gradientCard,
  padding: '20px',
  position: 'relative' as const,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
  overflow: 'hidden' as const,
};

/**
 * Стили для кнопок
 */
export const buttonStyle = {
  border: `${dashboardBorders.mainBorder} solid ${dashboardColors.borderRed}`,
  borderRadius: '12px',
  background: dashboardColors.gradientCard,
  padding: '12px 24px',
  position: 'relative' as const,
  cursor: 'pointer' as const,
  transition: 'all 0.3s ease',
  fontFamily: dashboardFonts.primary,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.2em',
  color: dashboardColors.textRed,
  textShadow: dashboardEffects.textShadow,
  backgroundClip: 'text' as const,
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  backgroundImage: dashboardColors.gradientRed,
  overflow: 'hidden' as const,
};

/**
 * Стили для текста с градиентом
 */
export const gradientTextStyle = {
  fontFamily: dashboardFonts.primary,
  textShadow: dashboardEffects.textShadow,
  background: dashboardColors.gradientRed,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

/**
 * Стили для статистики
 */
export const statBlockStyle = {
  border: `1px solid ${dashboardColors.borderAmber}`,
  borderRadius: '8px',
  background: 'rgba(10, 10, 10, 0.5)',
  padding: '10px 12px',
  minHeight: '40px',
};

