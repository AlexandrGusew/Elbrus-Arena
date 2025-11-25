import { useState } from "react";
import "./warrior-animations.css";

export function WarriorDead() {
  const [isDead, setIsDead] = useState(false);

  const handleDeath = () => {
    if (isDead) return; // предотвращаем повторное воспроизведение
    setIsDead(true);

    // анимация смерти длится 1 секунду и не зацикливается
    setTimeout(() => {
      // можно оставить в состоянии "мертв" или сбросить
      // setIsDead(false);
    }, 1000);
  };

  const resetAnimation = () => {
    setIsDead(false);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "warrior-animation warrior-dead " + 
          (isDead ? "warrior-dead--playing" : "")
        }
      />
      <div style={{ marginTop: 16 }}>
        <button onClick={handleDeath} disabled={isDead} style={{ marginRight: 8 }}>
          Смерть
        </button>
        <button onClick={resetAnimation}>
          Воскресить
        </button>
      </div>
    </div>
  );
}
