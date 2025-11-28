type AnimatedSpriteProps = {
  spriteSheet: string;
  frameCount: number;
  frameDuration?: number; // в миллисекундах
  width?: number;
  height?: number;
  loop?: boolean; // зацикливать анимацию или нет
  onAnimationEnd?: () => void; // колбэк когда анимация закончится
  rows?: number; // количество рядов в спрайтшите (по умолчанию 1)
};

export const AnimatedSprite = ({
  spriteSheet,
  frameCount,
  frameDuration = 150,
  width = 280,
  height = 280,
  loop = true,
  onAnimationEnd,
  rows = 1,
}: AnimatedSpriteProps) => {
  const animationDuration = (frameCount * frameDuration) / 1000; // в секундах
  const framesPerRow = Math.ceil(frameCount / rows);
  const animationName = `sprite-anim-${loop ? 'loop' : 'once'}-${frameCount}-${rows}`;

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage: `url(${spriteSheet})`,
        backgroundSize: `${framesPerRow * width}px ${rows * height}px`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0px 0px',
        animation: `${animationName} ${animationDuration}s steps(${frameCount}) ${loop ? 'infinite' : 'forwards'}`,
        imageRendering: 'pixelated',
      }}
      onAnimationEnd={onAnimationEnd}
    >
      <style>{`
        @keyframes ${animationName} {
          ${rows === 1 ? `
          to {
            background-position: -${framesPerRow * width}px 0px;
          }
          ` : `
          50% {
            background-position: -${framesPerRow * width}px 0px;
          }
          50.01% {
            background-position: 0px -${height}px;
          }
          100% {
            background-position: -${framesPerRow * width}px -${height}px;
          }
          `}
        }
      `}</style>
    </div>
  );
};
