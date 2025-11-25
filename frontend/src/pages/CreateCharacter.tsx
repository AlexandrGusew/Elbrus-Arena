import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CHARACTER_CLASSES } from '../types/api';
import type { CharacterClass, Character } from '../types/api';
import { Button, Card } from '../components/ui';
import { WarriorIdle } from '../components/warrior';
import { WizardIdle } from '../components/wizard';
import { SamuraiIdle } from '../components/samurai';

const CLASS_INFO = {
  warrior: {
    name: 'WARRIOR',
    icon: '⚔️',
    stats: 'STR: 15 • AGI: 8 • INT: 5',
    hp: 'HP: 150',
    description: 'Master of close combat and heavy armor'
  },
  mage: {
    name: 'MAGE',
    icon: '🔮',
    stats: 'STR: 5 • AGI: 10 • INT: 15',
    hp: 'HP: 120',
    description: 'Wielder of powerful arcane magic'
  },
  samurai: {
    name: 'SAMURAI',
    icon: '⚔️',
    stats: 'STR: 12 • AGI: 12 • INT: 6',
    hp: 'HP: 130',
    description: 'Master of the blade and honor'
  },
};

const CLASS_ANIMATIONS: Record<CharacterClass, React.ComponentType> = {
  warrior: WarriorIdle,
  mage: WizardIdle,
  samurai: SamuraiIdle,
};

const CreateCharacter = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('warrior');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Enter character name');
      return;
    }

    if (name.trim().length < 3 || name.trim().length > 20) {
      setError('Name must be 3-20 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fakeTelegramId = Math.floor(Math.random() * 1000000000);

      const response = await api.post<Character>('/character', {
        telegramId: fakeTelegramId,
        name: name.trim(),
        class: selectedClass,
      });

      const character = response.data;
      localStorage.setItem('characterId', character.id.toString());
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error creating character');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <Card className="mb-6">
          <h1 className="rf-title text-center mb-2">[ CHARACTER CREATION ]</h1>
          <p className="text-center" style={{ color: '#b8a890', letterSpacing: '0.15em' }}>
            Initialize new combat unit
          </p>
        </Card>

        {/* Name Input */}
        <div className="rf-panel mb-6">
          <label className="rf-data-label block mb-3">CHARACTER NAME:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name (3-20 characters)"
            className="rf-input"
            maxLength={20}
          />
          <p className="text-xs mt-2" style={{ color: '#b8a890' }}>
            Length: {name.length}/20
          </p>
        </div>

        {/* Class Selection */}
        <div className="rf-panel mb-6">
          <label className="rf-subtitle text-lg mb-4 block">[ SELECT CLASS ]</label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CHARACTER_CLASSES.map((cls) => {
              const AnimationComponent = CLASS_ANIMATIONS[cls];
              return (
                <div
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className="cursor-pointer transition-all duration-300"
                  style={{
                    background: selectedClass === cls
                      ? 'linear-gradient(135deg, rgba(212, 165, 116, 0.15), rgba(139, 111, 71, 0.1))'
                      : 'rgba(45, 36, 25, 0.6)',
                    border: selectedClass === cls ? '2px solid #d4a574' : '2px solid #6b5840',
                    borderRadius: '4px',
                    padding: '1.5rem',
                    boxShadow: selectedClass === cls
                      ? '0 0 16px rgba(212, 165, 116, 0.4)'
                      : '0 2px 8px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div className="flex justify-center items-center mb-3" style={{ height: '120px' }}>
                    <AnimationComponent compact />
                  </div>
                  <h3 className="rf-subtitle text-center text-lg mb-2">{CLASS_INFO[cls].name}</h3>
                  <p className="text-center rf-data-label text-sm mb-2">{CLASS_INFO[cls].stats}</p>
                  <p className="text-center rf-data-value text-sm mb-3">{CLASS_INFO[cls].hp}</p>
                  <p className="text-center text-xs" style={{ color: '#b8a890' }}>
                    {CLASS_INFO[cls].description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rf-panel mb-6" style={{ borderColor: '#ff3232', borderLeftColor: '#ff3232' }}>
            <p className="text-center" style={{ color: '#ff6464' }}>[ ERROR ] {error}</p>
          </div>
        )}

        {/* Create Button */}
        <Button
          onClick={handleCreate}
          disabled={loading || !name.trim()}
          variant={loading || !name.trim() ? 'secondary' : 'primary'}
          className="w-full"
        >
          {loading ? '[ INITIALIZING... ]' : '[ CREATE CHARACTER ]'}
        </Button>

        {/* Back to Dashboard */}
        <Button
          onClick={() => navigate('/dashboard')}
          variant="secondary"
          className="w-full mt-4"
        >
          [ RETURN TO DASHBOARD ]
        </Button>
      </div>
    </div>
  );
};

export default CreateCharacter;