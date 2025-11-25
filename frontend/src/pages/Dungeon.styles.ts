import { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  difficultyGrid: {
    display: 'grid',
    gap: '15px',
    marginBottom: '20px',
  },
  difficultyCard: {
    padding: '20px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  difficultyCardDefault: {
    border: '1px solid #444',
    background: '#1a1a1a',
  },
  difficultyCardSelected: {
    border: '2px solid #8b2c2f',
    background: '#2a1a1a',
  },
  difficultyName: {
    fontWeight: 'bold',
    fontSize: '20px',
    marginBottom: '8px',
  },
  difficultyDesc: {
    fontSize: '14px',
    color: '#aaa',
    marginBottom: '8px',
  },
  difficultyReward: {
    fontSize: '14px',
    color: '#d4af37',
  },
  button: {
    width: '100%',
    padding: '15px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#eae6dd',
    border: 'none',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  buttonActive: {
    background: '#8b2c2f',
    cursor: 'pointer',
  },
  buttonDisabled: {
    background: '#555',
    cursor: 'not-allowed',
  },
  buttonSecondary: {
    background: '#4a4a4a',
    cursor: 'pointer',
  },
  battleLog: {
    background: '#0b0b0f',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    maxHeight: '400px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '14px',
  },
  logEntry: {
    marginBottom: '8px',
    padding: '5px',
    borderRadius: '4px',
  },
  logPlayer: {
    color: '#4caf50',
  },
  logEnemy: {
    color: '#ff4444',
  },
  logInfo: {
    color: '#aaa',
  },
  logReward: {
    color: '#d4af37',
  },
  statsBlock: {
    background: '#1a1a1a',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  hpBarContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  hpBarOuter: {
    background: '#333',
    height: '20px',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  hpBarInner: (hpPercent: number): CSSProperties => ({
    background: hpPercent > 50 ? '#4caf50' : hpPercent > 25 ? '#ff9800' : '#f44336',
    height: '100%',
    width: `${hpPercent}%`,
    transition: 'width 0.3s',
  }),
};