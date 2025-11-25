import { useState, useEffect } from "react";
import "./wizard-animations.css";

interface WizardIdleProps {
  compact?: boolean;
}

export function WizardIdle({ compact = false }: WizardIdleProps) {
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
          "wizard-animation wizard-idle " +
          (isPlaying ? "wizard-idle--playing" : "")
        }
        style={{ display: 'block', margin: '0 auto' }}
      />
    );
  }

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "wizard-animation wizard-idle " +
          (isPlaying ? "wizard-idle--playing" : "")
        }
      />
      <button onClick={toggleAnimation} style={{ marginTop: 16 }}>
        {isPlaying ? "Остановить медитацию" : "Начать медитацию"}
      </button>
    </div>
  );
}

