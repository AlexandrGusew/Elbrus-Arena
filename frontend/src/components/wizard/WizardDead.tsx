import { useState } from "react";
import "./wizard-animations.css";

export function WizardDead() {
  const [isDead, setIsDead] = useState(false);

  const handleDeath = () => {
    if (isDead) return; // предотвращаем повторное воспроизведение
    setIsDead(true);

    // анимация смерти длится 1.2 секунды и не зацикливается
    setTimeout(() => {
      // можно оставить в состоянии "мертв" или сбросить
      // setIsDead(false);
    }, 1200);
  };

  const resetAnimation = () => {
    setIsDead(false);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "wizard-animation wizard-dead " + 
          (isDead ? "wizard-dead--playing" : "")
        }
      />
      <div style={{ marginTop: 16 }}>
        <button onClick={handleDeath} disabled={isDead} style={{ marginRight: 8 }}>
          Смерть мага
        </button>
        <button onClick={resetAnimation}>
          Воскрешение
        </button>
      </div>
    </div>
  );
}

