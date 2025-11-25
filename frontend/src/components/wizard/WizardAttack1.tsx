import { useState } from "react";
import "./wizard-animations.css";

export function WizardAttack1() {
  const [isAttacking, setIsAttacking] = useState(false);

  const handleAttack = () => {
    if (isAttacking) return; // предотвращаем спам
    setIsAttacking(true);

    // анимация длится 0.8 секунды
    setTimeout(() => setIsAttacking(false), 800);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "wizard-animation wizard-attack1 " + 
          (isAttacking ? "wizard-attack1--playing" : "")
        }
      />
      <button onClick={handleAttack} style={{ marginTop: 16 }}>
        Магическая стрела
      </button>
    </div>
  );
}

