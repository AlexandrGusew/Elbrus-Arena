import { useState } from "react";
import "./yuokai-animations.css";

export function YuokaiAttack2() {
  const [isAttacking, setIsAttacking] = useState(false);

  const handleAttack = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 1000);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "yuokai-animation yuokai-attack2 " +
          (isAttacking ? "yuokai-attack2--playing" : "")
        }
      />
      <button onClick={handleAttack} style={{ marginTop: 16 }}>
        Атака 2
      </button>
    </div>
  );
}
