import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { DungeonDifficulty, DungeonWithMonsters, Character } from '../types/api';
import { useBattle } from '../hooks/useBattle';
import { styles } from './Dungeon.styles';
import { CharacterStats } from '../components/battle/CharacterStats';
import { DifficultySelector } from '../components/battle/DifficultySelector';
import { BattleArena } from '../components/battle/BattleArena';

const Dungeon = () => {
  const navigate = useNavigate();
  const [dungeons, setDungeons] = useState<DungeonWithMonsters[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DungeonDifficulty>('easy');
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [battleId, setBattleId] = useState<string | null>(null);

  const { battleState, sendRoundActions, isConnected } = useBattle(battleId);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const characterId = localStorage.getItem('characterId');

    if (!characterId) {
      navigate('/');
      return;
    }

    try {
      const [dungeonsRes, charRes] = await Promise.all([
        api.get<DungeonWithMonsters[]>('/dungeons'),
        api.get<Character>(`/character/${characterId}`)
      ]);

      setDungeons(dungeonsRes.data);
      setCharacter(charRes.data);
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  const startBattle = async () => {
    if (!character) return;

    const selectedDungeon = dungeons.find(d => d.difficulty === selectedDifficulty);
    if (!selectedDungeon) {
      alert('Выберите подземелье');
      return;
    }

    try {
      const response = await api.post<{ id: string }>('/battle/start', {
        characterId: character.id,
        dungeonId: selectedDungeon.id,
      });

      setBattleId(response.data.id);
    } catch (err: any) {
      alert('Ошибка при создании боя: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetBattle = () => {
    setBattleId(null);
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
  }

  if (!character) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Персонаж не найден</div>;
  }

  if (!battleId) {
    return (
      <div style={styles.container}>
        <h1>⚔️ Подземелье</h1>

        <CharacterStats character={character} />

        <DifficultySelector
          selectedDifficulty={selectedDifficulty}
          onSelect={setSelectedDifficulty}
        />

        <button
          onClick={startBattle}
          disabled={character.stamina < 10}
          style={{
            ...styles.button,
            ...(character.stamina >= 10 ? styles.buttonActive : styles.buttonDisabled),
          }}
        >
          {character.stamina >= 10 ? 'Начать бой!' : 'Недостаточно выносливости (10)'}
        </button>

        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <button style={{ ...styles.button, ...styles.buttonSecondary }}>
            ← Вернуться на базу
          </button>
        </Link>
      </div>
    );
  }

  return (
    <BattleArena
      battleState={battleState}
      isConnected={isConnected}
      onSubmitActions={sendRoundActions}
      onReset={resetBattle}
    />
  );
};

export default Dungeon;