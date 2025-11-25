import { useState, useEffect } from "react";
import "./samurai-animations.css";

interface SamuraiIdleProps {
  compact?: boolean;
}

export function SamuraiIdle({ compact = false }: SamuraiIdleProps) {
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    // Автоматически запускаем анимацию простоя
    setIsPlaying(true);
  }, []);

  if (compact) {
    return (
      <div
        className={
          "samurai-animation samurai-idle " +
          (isPlaying ? "samurai-idle--playing" : "")
        }
        style={{ display: 'block', margin: '0 auto' }}
      />
    );
  }

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "samurai-animation samurai-idle " +
          (isPlaying ? "samurai-idle--playing" : "")
        }
      />
      <button onClick={() => setIsPlaying(!isPlaying)} style={{ marginTop: 16 }}>
        {isPlaying ? "Остановить" : "Запустить"}
      </button>
    </div>
  );
}
