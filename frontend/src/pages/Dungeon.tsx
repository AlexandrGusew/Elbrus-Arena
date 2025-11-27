import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetCharacterQuery } from '../store/api/characterApi';
import { useGetDungeonsQuery, useStartBattleMutation } from '../store/api/battleApi';
import type { DungeonDifficulty } from '../types/api';
import { useBattle } from '../hooks/useBattle';
import { styles } from './Dungeon.styles';
import { CharacterStats } from '../components/battle/CharacterStats';
import { DifficultySelector } from '../components/battle/DifficultySelector';
import { BattleArena } from '../components/battle/BattleArena';

const Dungeon = () => {
  const navigate = useNavigate();
  const characterId = localStorage.getItem('characterId');

  const [selectedDifficulty, setSelectedDifficulty] = useState<DungeonDifficulty>('easy');
  const [battleId, setBattleId] = useState<string | null>(null);

  const { data: character, isLoading: characterLoading } = useGetCharacterQuery(
    Number(characterId),
    { skip: !characterId }
  );

  const { data: dungeons = [], isLoading: dungeonsLoading } = useGetDungeonsQuery();
  const [startBattleMutation] = useStartBattleMutation();

  const { battleState, sendRoundActions, isConnected } = useBattle(battleId);

  const selectedDungeon = dungeons.find(d => d.difficulty === selectedDifficulty);
  const requiredStamina = selectedDungeon?.staminaCost || 20;

  const startBattle = async () => {
    if (!character) return;

    if (!selectedDungeon) {
      alert('Выберите подземелье');
      return;
    }

    if (character.stamina < requiredStamina) {
      alert(`Недостаточно выносливости! Требуется: ${requiredStamina}, доступно: ${character.stamina}`);
      return;
    }

    try {
      const result = await startBattleMutation({
        characterId: character.id,
        dungeonId: selectedDungeon.id,
      }).unwrap();

      setBattleId(result.id);
    } catch (err: any) {
      alert('Ошибка при создании боя: ' + (err?.data?.message || err.message || 'Неизвестная ошибка'));
    }
  };

  const resetBattle = () => {
    setBattleId(null);
  };

  if (!characterId) {
    navigate('/');
    return null;
  }

  const loading = characterLoading || dungeonsLoading;

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
          disabled={character.stamina < requiredStamina}
          style={{
            ...styles.button,
            ...(character.stamina >= requiredStamina ? styles.buttonActive : styles.buttonDisabled),
          }}
        >
          {character.stamina >= requiredStamina
            ? 'Начать бой!'
            : `Недостаточно выносливости (${requiredStamina})`}
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
      character={character}
      battleState={battleState}
      isConnected={isConnected}
      onSubmitActions={sendRoundActions}
      onReset={resetBattle}
    />
  );
};

export default Dungeon;