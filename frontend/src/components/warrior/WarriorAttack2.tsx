import { useState } from "react";
import "./warrior-animations.css";

export function WarriorAttack2() {
  const [isAttacking, setIsAttacking] = useState(false);

  const handleAttack = () => {
    if (isAttacking) return; // предотвращаем спам
    setIsAttacking(true);

    // анимация длится 0.6 секунды
    setTimeout(() => setIsAttacking(false), 600);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "warrior-animation warrior-attack2 " + 
          (isAttacking ? "warrior-attack2--playing" : "")
        }
      />
      <button onClick={handleAttack} style={{ marginTop: 16 }}>
        Мощный удар
      </button>
    </div>
  );
}
