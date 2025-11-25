import { useState } from "react";
import "./yuokai-animations.css";

export function YuokaiAttack3() {
  const [isAttacking, setIsAttacking] = useState(false);

  const handleAttack = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 600);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "yuokai-animation yuokai-attack3 " +
          (isAttacking ? "yuokai-attack3--playing" : "")
        }
      />
      <button onClick={handleAttack} style={{ marginTop: 16 }}>
        Атака 3
      </button>
    </div>
  );
}
