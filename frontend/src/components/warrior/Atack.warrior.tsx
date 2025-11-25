// WarriorAttack1.tsx
import { useState } from "react";
import "./warrior-animations.css";

export function WarriorAttack1() {
  const [isAttacking, setIsAttacking] = useState(false);

  const handleAttack = () => {
    if (isAttacking) return; // чтобы не спамить
    setIsAttacking(true);

    // после окончания анимации (0.5s) сбрасываем состояние
    setTimeout(() => setIsAttacking(false), 500);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "warrior-animation warrior-attack1 " + 
          (isAttacking ? "warrior-attack1--playing" : "")
        }
      />
      <button onClick={handleAttack} style={{ marginTop: 16 }}>
        Быстрый удар
      </button>
    </div>
  );
}
