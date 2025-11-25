import { useState } from "react";
import "./samurai-animations.css";

export function SamuraiAttack3() {
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
          "samurai-animation samurai-attack3 " +
          (isAttacking ? "samurai-attack3--playing" : "")
        }
      />
      <button onClick={handleAttack} style={{ marginTop: 16 }}>
        Атака 3
      </button>
    </div>
  );
}
