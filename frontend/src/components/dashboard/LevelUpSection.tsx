import { useState } from 'react';
import type { Character } from '../../types/api';
import {
  useGetLevelProgressQuery,
  useDistributeStatsMutation,
} from '../../store/api/characterApi';

interface LevelUpSectionProps {
  character: Character;
  onBack?: () => void;
}

export function LevelUpSection({ character, onBack }: LevelUpSectionProps) {
  const { data: levelProgress } = useGetLevelProgressQuery(character.id);
  const [distributeStats, { isLoading: isDistributing }] = useDistributeStatsMutation();

  const [pendingStr, setPendingStr] = useState(0);
  const [pendingAgi, setPendingAgi] = useState(0);
  const [pendingInt, setPendingInt] = useState(0);
  const [pendingHp, setPendingHp] = useState(0);
  const [pendingStamina, setPendingStamina] = useState(0);

  if (!levelProgress) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-amber-600">Загрузка...</div>
      </div>
    );
  }

  const pointsUsed = pendingStr + pendingAgi + pendingInt + pendingHp + pendingStamina;
  const pointsRemaining = levelProgress.freePoints - pointsUsed;

  // Константы для расчета прироста
  const HP_PER_POINT = 10; // +10 HP за очко
  const STAMINA_PER_POINT = 5; // +5 Stamina за очко

  const handleIncrement = (
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    if (pointsRemaining > 0) {
      setter((prev) => prev + 1);
    }
  };

  const handleDecrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    current: number
  ) => {
    if (current > 0) {
      setter((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setPendingStr(0);
    setPendingAgi(0);
    setPendingInt(0);
    setPendingHp(0);
    setPendingStamina(0);
  };

  const handleApply = async () => {
    if (pointsUsed === 0) {
      alert('Распределите хотя бы одно очко!');
      return;
    }

    try {
      await distributeStats({
        characterId: character.id,
        strength: pendingStr,
        agility: pendingAgi,
        intelligence: pendingInt,
        maxHp: pendingHp,
        stamina: pendingStamina,
      }).unwrap();

      // Сброс временных очков
      setPendingStr(0);
      setPendingAgi(0);
      setPendingInt(0);
      setPendingHp(0);
      setPendingStamina(0);

      alert('Характеристики успешно улучшены!');
    } catch (error: any) {
      alert(`Ошибка: ${error.data?.message || 'Не удалось распределить очки'}`);
    }
  };

  // Функция для рендеринга строки характеристики
  const renderStatRow = (
    label: string,
    emoji: string,
    currentValue: number,
    pendingValue: number,
    previewValue?: number,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => (
    <div className="flex items-center justify-between py-3 border-b border-amber-800/30 last:border-b-0">
      <div className="flex-1">
        <span className="text-amber-200 text-sm font-semibold">
          {emoji} {label}: {currentValue}
        </span>
        {pendingValue > 0 && (
          <span className="text-green-400 ml-2 font-bold">
            +{previewValue !== undefined ? previewValue : pendingValue}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleDecrement(setter, pendingValue)}
          disabled={pendingValue === 0}
          className="w-10 h-10 rounded border-2 border-amber-800/40 bg-gradient-to-b from-stone-950/50 to-black/50 text-amber-200 hover:border-amber-600/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-lg"
        >
          -
        </button>
        <div className="w-10 text-center text-amber-200 font-bold">
          {pendingValue}
        </div>
        <button
          onClick={() => handleIncrement(setter)}
          disabled={pointsRemaining === 0}
          className="w-10 h-10 rounded border-2 border-amber-800/40 bg-gradient-to-b from-stone-950/50 to-black/50 text-amber-200 hover:border-amber-600/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-lg"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-stone-950/90 to-black/90 border-2 border-amber-800/40 rounded-lg p-4 overflow-y-auto">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-amber-200 uppercase tracking-wider">
          Распределение характеристик
        </h2>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 rounded border-2 border-amber-800/40 bg-gradient-to-b from-stone-950/50 to-black/50 text-amber-200 hover:border-amber-600/60 transition-all"
          >
            Назад
          </button>
        )}
      </div>

      {/* Блок с доступными очками */}
      <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 p-4 mb-4">
        <div className="text-center">
          <div className="text-sm text-amber-400 mb-2">Доступно очков</div>
          <div className="text-3xl font-bold text-amber-200">
            {pointsRemaining}
          </div>
          {levelProgress.freePoints === 0 && (
            <p className="text-xs text-amber-600/70 mt-2">
              Получайте опыт в подземельях для повышения уровня!
            </p>
          )}
        </div>
      </div>

      {/* Список характеристик */}
      {levelProgress.freePoints > 0 && (
        <div className="flex-1 border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 p-4 mb-4">
          <h3 className="text-lg font-bold text-amber-200 mb-4">
            Распределение очков
          </h3>

          <div className="space-y-2">
            {renderStatRow(
              'Сила',
              '💪',
              character.strength,
              pendingStr,
              undefined,
              setPendingStr
            )}

            {renderStatRow(
              'Ловкость',
              '🏃',
              character.agility,
              pendingAgi,
              undefined,
              setPendingAgi
            )}

            {renderStatRow(
              'Интеллект',
              '🧠',
              character.intelligence,
              pendingInt,
              undefined,
              setPendingInt
            )}

            {renderStatRow(
              'HP',
              '❤️',
              character.maxHp,
              pendingHp,
              pendingHp * HP_PER_POINT,
              setPendingHp
            )}

            {renderStatRow(
              'Выносливость',
              '⚡',
              character.stamina,
              pendingStamina,
              pendingStamina * STAMINA_PER_POINT,
              setPendingStamina
            )}
          </div>
        </div>
      )}

      {/* Кнопки управления */}
      {levelProgress.freePoints > 0 && (
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            disabled={pointsUsed === 0}
            className="flex-1 py-2 rounded border-2 border-amber-800/40 bg-gradient-to-b from-stone-950/50 to-black/50 text-amber-200 hover:border-amber-600/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            Сбросить
          </button>
          <button
            onClick={handleApply}
            disabled={pointsUsed === 0 || isDistributing}
            className="flex-1 py-2 rounded border-2 border-amber-800/40 bg-gradient-to-b from-amber-900/50 to-amber-950/50 text-amber-200 hover:border-amber-600/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isDistributing ? 'Применение...' : 'Применить'}
          </button>
        </div>
      )}

      {/* Информация об опыте */}
      <div className="mt-4 border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 p-3">
        <div className="text-xs text-amber-400 mb-1">Опыт до следующего уровня</div>
        <div className="text-sm text-amber-200 font-semibold">
          {levelProgress.currentExp} / {levelProgress.expForNextLevel || levelProgress.requiredExp || 0}
        </div>
        <div className="mt-2 h-2 bg-black/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-700 to-amber-500 transition-all duration-300"
            style={{ width: `${levelProgress.progress || 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}

