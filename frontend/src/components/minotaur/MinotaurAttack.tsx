import { useState } from "react";
import "./minotaur-animations.css";

export function MinotaurAttack() {
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
          "minotaur-animation minotaur-attack " +
          (isAttacking ? "minotaur-attack--playing" : "")
        }
      />
      <button onClick={handleAttack} style={{ marginTop: 16 }}>
        Атака топором
      </button>
    </div>
  );
}
