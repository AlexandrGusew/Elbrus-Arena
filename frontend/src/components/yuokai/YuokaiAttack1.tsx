import { useState } from "react";
import "./yuokai-animations.css";

export function YuokaiAttack1() {
  const [isAttacking, setIsAttacking] = useState(false);

  const handleAttack = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 500);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "yuokai-animation yuokai-attack1 " +
          (isAttacking ? "yuokai-attack1--playing" : "")
        }
      />
      <button onClick={handleAttack} style={{ marginTop: 16 }}>
        Атака 1
      </button>
    </div>
  );
}
