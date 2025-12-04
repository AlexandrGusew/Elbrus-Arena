import { ReactNode } from 'react';

interface GameViewportProps {
  children: ReactNode;
  // Целевое разрешение игры
  targetWidth?: number;
  targetHeight?: number;
}

/**
 * Компонент для фиксированного разрешения игры.
 * 
 * Принцип работы:
 * - Фиксирует внутреннее разрешение (например, 1440x1080)
 * - Если экран меньше - показывается прокрутка
 * - Если экран больше - контент центрируется с черными полями
 */
export const GameViewport = ({ 
  children, 
  targetWidth = 1440, 
  targetHeight = 1080 
}: GameViewportProps) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        overflow: 'auto', // Прокрутка, если контент больше экрана
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Игровая область с фиксированным разрешением */}
      <div
        style={{
          width: `${targetWidth}px`,
          height: `${targetHeight}px`,
          minWidth: `${targetWidth}px`, // Минимальный размер - не уменьшается
          minHeight: `${targetHeight}px`, // Минимальный размер - не уменьшается
          backgroundColor: '#1a1a1a',
          position: 'relative',
          overflow: 'hidden',
          margin: 'auto', // Центрирование
        }}
      >
        {children}
      </div>
    </div>
  );
};

