import { useState } from "react";
import "./wizard-animations.css";

export function WizardAttack2() {
  const [isAttacking, setIsAttacking] = useState(false);

  const handleAttack = () => {
    if (isAttacking) return; // предотвращаем спам
    setIsAttacking(true);

    // анимация длится 1.8 секунды (9 кадров)
    setTimeout(() => setIsAttacking(false), 1800);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "wizard-animation wizard-attack2 " + 
          (isAttacking ? "wizard-attack2--playing" : "")
        }
      />
      <button onClick={handleAttack} style={{ marginTop: 16 }}>
        Огненный шар
      </button>
    </div>
  );
}

