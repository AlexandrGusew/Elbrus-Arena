import React from "react";
import {
  SamuraiIdle,
  SamuraiWalk,
  SamuraiAttack1,
  SamuraiAttack2,
  SamuraiAttack3,
  SamuraiDead
} from "./index";

export function SamuraiAnimationsDemo() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      padding: "20px",
      backgroundColor: "#1a1a2e",
      minHeight: "100vh"
    }}>
      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Покой</h3>
        <SamuraiIdle />
      </div>

      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Ходьба</h3>
        <SamuraiWalk />
      </div>

      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Удар мечом</h3>
        <SamuraiAttack1 />
      </div>

      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Второй удар</h3>
        <SamuraiAttack2 />
      </div>

      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Третий удар</h3>
        <SamuraiAttack3 />
      </div>

      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Смерть</h3>
        <SamuraiDead />
      </div>
    </div>
  );
}
