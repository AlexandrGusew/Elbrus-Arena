import { useState } from "react";
import "./samurai-animations.css";

export function SamuraiAttack2() {
  const [isAttacking, setIsAttacking] = useState(false);

  const handleAttack = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 800);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "samurai-animation samurai-attack2 " +
          (isAttacking ? "samurai-attack2--playing" : "")
        }
      />
      <button onClick={handleAttack} style={{ marginTop: 16 }}>
        Атака 2
      </button>
    </div>
  );
}
