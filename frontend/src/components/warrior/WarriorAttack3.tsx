import { useState } from "react";
import "./warrior-animations.css";

export function WarriorAttack3() {
  const [isAttacking, setIsAttacking] = useState(false);

  const handleAttack = () => {
    if (isAttacking) return; // предотвращаем спам
    setIsAttacking(true);

    // анимация длится 0.7 секунды
    setTimeout(() => setIsAttacking(false), 700);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "warrior-animation warrior-attack3 " + 
          (isAttacking ? "warrior-attack3--playing" : "")
        }
      />
      <button onClick={handleAttack} style={{ marginTop: 16 }}>
        Критический удар
      </button>
    </div>
  );
}
