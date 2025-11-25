import { useState } from "react";
import "./samurai-animations.css";

export function SamuraiAttack1() {
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
          "samurai-animation samurai-attack1 " +
          (isAttacking ? "samurai-attack1--playing" : "")
        }
      />
      <button onClick={handleAttack} style={{ marginTop: 16 }}>
        Атака 1
      </button>
    </div>
  );
}
