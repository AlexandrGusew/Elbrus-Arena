import { Link } from 'react-router-dom';
import { useCharacter } from '../hooks/useCharacter';
import { Button, Card } from '../components/ui';
import { WarriorIdle } from '../components/warrior';
import { WizardIdle } from '../components/wizard';
import { SamuraiIdle } from '../components/samurai';
import type { CharacterClass } from '../types/api';

const CLASS_ANIMATIONS: Record<CharacterClass, React.ComponentType<{ compact?: boolean }>> = {
  warrior: WarriorIdle,
  mage: WizardIdle,
  samurai: SamuraiIdle,
};

const Dashboard = () => {
  const { character, loading, error } = useCharacter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <p className="rf-subtitle text-center">[ LOADING DATA... ]</p>
        </Card>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <h2 className="rf-title text-2xl text-center mb-6">[ ERROR ]</h2>
          <p className="text-center text-red-400 mb-6">{error || 'Персонаж не найден'}</p>
          <Link to="/" className="block">
            <Button variant="primary" className="w-full">Создать персонажа</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const hpPercent = (character.currentHp / character.maxHp) * 100;

  return (
    <div className="min-h-screen p-4 max-w-6xl mx-auto">
      {/* Header */}
      <Card className="mb-6">
        <h1 className="rf-title text-center mb-2">[ {character.name} ]</h1>
        <p className="text-center" style={{ color: '#b8a890', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          Level {character.level} • {character.class}
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Character Avatar */}
          <Card>
            <div className="flex justify-center items-center" style={{ minHeight: '150px' }}>
              {(() => {
                const AnimationComponent = CLASS_ANIMATIONS[character.class as CharacterClass];
                return <AnimationComponent compact />;
              })()}
            </div>
          </Card>

          {/* Stats */}
          <div className="rf-panel">
            <h3 className="rf-subtitle text-lg mb-4">[ ATTRIBUTES ]</h3>
            <div className="space-y-2">
              <div className="rf-data-row">
                <span className="rf-data-label">💪 Strength</span>
                <span className="rf-data-value">{character.strength}</span>
              </div>
              <div className="rf-data-row">
                <span className="rf-data-label">🏃 Agility</span>
                <span className="rf-data-value">{character.agility}</span>
              </div>
              <div className="rf-data-row">
                <span className="rf-data-label">🧠 Intelligence</span>
                <span className="rf-data-value">{character.intelligence}</span>
              </div>
              <div className="rf-data-row">
                <span className="rf-data-label">⭐ Free Points</span>
                <span className="rf-data-value">{character.freePoints}</span>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rf-panel">
              <div className="rf-data-label text-center mb-2">⚡ Stamina</div>
              <div className="rf-data-value text-center text-3xl">{character.stamina}</div>
            </div>
            <div className="rf-panel">
              <div className="rf-data-label text-center mb-2">💰 Gold</div>
              <div className="rf-data-value text-center text-3xl">{character.gold}</div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* HP Bar */}
          <div className="rf-panel">
            <div className="flex justify-between mb-2">
              <span className="rf-data-label">❤️ Health Points</span>
              <span className="rf-data-value">{character.currentHp} / {character.maxHp}</span>
            </div>
            <div style={{
              width: '100%',
              height: '30px',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '2px solid #6b5840',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${hpPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #ff3232, #ff6464)',
                boxShadow: '0 0 20px rgba(255, 50, 50, 0.8)',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Inventory */}
          <div className="rf-panel">
            <h3 className="rf-subtitle text-lg mb-4">
              [ INVENTORY {character.inventory.items.length} / {character.inventory.size} ]
            </h3>
            {character.inventory.items.length === 0 ? (
              <p className="text-center" style={{ color: '#b8a890' }}>Inventory is empty</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {character.inventory.items.map((invItem) => (
                  <div
                    key={invItem.id}
                    className="rf-data-row"
                    style={invItem.isEquipped ? { borderColor: '#d4a574' } : {}}
                  >
                    <div>
                      <div className="rf-data-value text-sm">
                        {invItem.item.name} {invItem.isEquipped && '(Equipped)'}
                      </div>
                      <div className="rf-data-label text-xs">
                        {invItem.item.type} • DMG: {invItem.item.damage} • ARM: {invItem.item.armor}
                        {invItem.enhancement > 0 && ` • +${invItem.enhancement}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Link to="/dungeon">
              <Button variant="primary" className="w-full">
                ⚔️ Dungeon
              </Button>
            </Link>
            <Link to="/pvp">
              <Button variant="secondary" className="w-full">
                🗡️ PvP Arena
              </Button>
            </Link>
            <Link to="/blacksmith">
              <Button variant="secondary" className="w-full">
                🔨 Blacksmith
              </Button>
            </Link>
            <Link to="/character-creation">
              <Button variant="secondary" className="w-full">
                👤 Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;