import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { DungeonDifficulty, DungeonWithMonsters, Character } from '../types/api';
import { useBattle } from '../hooks/useBattle';
import { styles } from './Dungeon.styles';
import { CharacterStats } from '../components/battle/CharacterStats';
import { DifficultySelector } from '../components/battle/DifficultySelector';
import { BattleArena } from '../components/battle/BattleArena';
import { Button, Card } from '../components/ui';

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <p className="rf-subtitle text-center">[ LOADING DUNGEON DATA... ]</p>
        </Card>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <p className="rf-title text-center">[ CHARACTER NOT FOUND ]</p>
          <Link to="/" className="block mt-6">
            <Button variant="primary" className="w-full">Return to Base</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!battleId) {
    return (
      <div className="min-h-screen p-4 max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <h1 className="rf-title text-center">[ DUNGEON SELECTION ]</h1>
          <p className="text-center mt-2" style={{ color: '#b8a890', letterSpacing: '0.15em' }}>
            Choose your challenge
          </p>
        </Card>

        {/* Character Stats */}
        <div className="rf-panel mb-6">
          <h3 className="rf-subtitle text-lg mb-4">[ OPERATIVE STATUS ]</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rf-data-row flex-col items-center">
              <span className="rf-data-label">Name</span>
              <span className="rf-data-value">{character.name}</span>
            </div>
            <div className="rf-data-row flex-col items-center">
              <span className="rf-data-label">Level</span>
              <span className="rf-data-value">{character.level}</span>
            </div>
            <div className="rf-data-row flex-col items-center">
              <span className="rf-data-label">⚡ Stamina</span>
              <span className="rf-data-value">{character.stamina}</span>
            </div>
            <div className="rf-data-row flex-col items-center">
              <span className="rf-data-label">❤️ HP</span>
              <span className="rf-data-value">{character.currentHp}/{character.maxHp}</span>
            </div>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="rf-panel mb-6">
          <h3 className="rf-subtitle text-lg mb-4">[ DIFFICULTY LEVEL ]</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['easy', 'medium', 'hard'] as DungeonDifficulty[]).map((diff) => (
              <div
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className="cursor-pointer transition-all duration-300"
                style={{
                  background: selectedDifficulty === diff
                    ? 'linear-gradient(135deg, rgba(212, 165, 116, 0.15), rgba(139, 111, 71, 0.1))'
                    : 'rgba(45, 36, 25, 0.6)',
                  border: selectedDifficulty === diff ? '2px solid #d4a574' : '2px solid #6b5840',
                  borderRadius: '4px',
                  padding: '1.5rem',
                  boxShadow: selectedDifficulty === diff
                    ? '0 0 16px rgba(212, 165, 116, 0.4)'
                    : '0 2px 8px rgba(0, 0, 0, 0.4)',
                }}
              >
                <h4 className="rf-subtitle text-center mb-2">
                  {diff === 'easy' && '[ EASY ]'}
                  {diff === 'medium' && '[ MEDIUM ]'}
                  {diff === 'hard' && '[ HARD ]'}
                </h4>
                <p className="rf-data-label text-center text-sm">
                  {diff === 'easy' && 'Stamina Cost: 10'}
                  {diff === 'medium' && 'Stamina Cost: 20'}
                  {diff === 'hard' && 'Stamina Cost: 30'}
                </p>
                <p className="rf-data-value text-center text-sm mt-2">
                  {diff === 'easy' && 'Rewards: +50 EXP, +100 Gold'}
                  {diff === 'medium' && 'Rewards: +150 EXP, +300 Gold'}
                  {diff === 'hard' && 'Rewards: +300 EXP, +600 Gold'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={startBattle}
            disabled={character.stamina < 10}
            variant={character.stamina >= 10 ? 'primary' : 'danger'}
            className="w-full"
          >
            {character.stamina >= 10 ? '[ START BATTLE ]' : '[ INSUFFICIENT STAMINA ]'}
          </Button>

          <Link to="/dashboard">
            <Button variant="secondary" className="w-full">
              ← [ RETURN TO BASE ]
            </Button>
          </Link>
        </div>
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