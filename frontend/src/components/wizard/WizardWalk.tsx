import { useState } from "react";
import "./wizard-animations.css";

export function WizardWalk() {
  const [isWalking, setIsWalking] = useState(false);

  const toggleWalk = () => {
    setIsWalking(!isWalking);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "wizard-animation wizard-walk " + 
          (isWalking ? "wizard-walk--playing" : "")
        }
      />
      <button onClick={toggleWalk} style={{ marginTop: 16 }}>
        {isWalking ? "Остановить левитацию" : "Начать левитацию"}
      </button>
    </div>
  );
}

