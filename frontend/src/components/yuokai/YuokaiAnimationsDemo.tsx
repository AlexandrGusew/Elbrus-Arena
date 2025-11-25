import React from "react";
import {
  YuokaiIdle,
  YuokaiWalk,
  YuokaiAttack1,
  YuokaiAttack2,
  YuokaiAttack3,
  YuokaiDead
} from "./index";

export function YuokaiAnimationsDemo() {
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
        <YuokaiIdle />
      </div>

      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Ходьба</h3>
        <YuokaiWalk />
      </div>

      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Быстрый удар</h3>
        <YuokaiAttack1 />
      </div>

      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Мощная атака</h3>
        <YuokaiAttack2 />
      </div>

      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Третья атака</h3>
        <YuokaiAttack3 />
      </div>

      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Смерть</h3>
        <YuokaiDead />
      </div>
    </div>
  );
}
