import { ReactNode, useEffect, useState } from 'react';

interface GameViewportProps {
  children: ReactNode;
  // Целевое разрешение игры
  targetWidth?: number;
  targetHeight?: number;
}

/**
 * Компонент для фиксированного разрешения игры с черными полями (letterboxing).
 * 
 * Принцип работы:
 * - Фиксирует внутреннее разрешение (например, 1366x768)
 * - Автоматически масштабирует под размер окна браузера
 * - Центрирует контент
 * - Остальное пространство заполняет черным фоном
 */
export const GameViewport = ({ 
  children, 
  targetWidth = 1366, 
  targetHeight = 768 
}: GameViewportProps) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateViewport = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Вычисляем масштаб для вписывания в окно с сохранением пропорций
      const scaleX = windowWidth / targetWidth;
      const scaleY = windowHeight / targetHeight;
      const newScale = Math.min(scaleX, scaleY);
      
      // Вычисляем размеры масштабированного viewport
      const scaledWidth = targetWidth * newScale;
      const scaledHeight = targetHeight * newScale;
      
      // Центрируем viewport
      const offsetX = (windowWidth - scaledWidth) / 2;
      const offsetY = (windowHeight - scaledHeight) / 2;
      
      setScale(newScale);
      setOffset({ x: offsetX, y: offsetY });
    };

    // Обновляем при монтировании
    updateViewport();
    
    // Обновляем при изменении размера окна
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, [targetWidth, targetHeight]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000', // Черный фон вокруг
        overflow: 'hidden',
      }}
    >
      {/* Игровая область с фиксированным разрешением */}
      <div
        style={{
          position: 'absolute',
          left: `${offset.x}px`,
          top: `${offset.y}px`,
          width: `${targetWidth}px`,
          height: `${targetHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          backgroundColor: '#1a1a1a', // Фон игровой области
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
};

