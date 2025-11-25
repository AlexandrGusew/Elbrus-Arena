import { useState } from "react";
import "./wearwolf-animations.css";

export function WearwolfWalk() {
  const [isWalking, setIsWalking] = useState(false);

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "wearwolf-animation wearwolf-walk " +
          (isWalking ? "wearwolf-walk--playing" : "")
        }
      />
      <button onClick={() => setIsWalking(!isWalking)} style={{ marginTop: 16 }}>
        {isWalking ? "Остановить" : "Запустить"}
      </button>
    </div>
  );
}
