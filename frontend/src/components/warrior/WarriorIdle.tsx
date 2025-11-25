import { useState, useEffect } from "react";
import "./warrior-animations.css";

interface WarriorIdleProps {
  compact?: boolean;
}

export function WarriorIdle({ compact = false }: WarriorIdleProps) {
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    // Автоматически запускаем анимацию простоя
    setIsPlaying(true);
  }, []);

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };

  if (compact) {
    return (
      <div
        className={
          "warrior-animation warrior-idle " +
          (isPlaying ? "warrior-idle--playing" : "")
        }
        style={{ display: 'block', margin: '0 auto' }}
      />
    );
  }

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "warrior-animation warrior-idle " +
          (isPlaying ? "warrior-idle--playing" : "")
        }
      />
      <button onClick={toggleAnimation} style={{ marginTop: 16 }}>
        {isPlaying ? "Остановить простой" : "Запустить простой"}
      </button>
    </div>
  );
}
