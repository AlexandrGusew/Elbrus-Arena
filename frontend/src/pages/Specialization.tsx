import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetCharacterQuery } from '../store/api/characterApi';
import {
  useGetAvailableBranchesQuery,
  useGetCharacterSpecializationQuery,
  useGetBranchAbilitiesQuery,
  useChooseBranchMutation,
  useChangeBranchMutation,
  useUnlockTierMutation,
} from '../store/api/specializationApi';
import { styles } from './Specialization.styles';
import type { SpecializationBranch } from '../../../shared/types';

const BRANCH_NAMES: Record<SpecializationBranch, string> = {
  PALADIN: 'Паладин',
  BARBARIAN: 'Варвар',
  SHADOW_DANCER: 'Танцор теней',
  POISONER: 'Отравитель',
  FROST_MAGE: 'Ледяной маг',
  WARLOCK: 'Чернокнижник',
};

const Specialization = () => {
  const navigate = useNavigate();
  const characterId = localStorage.getItem('characterId');

  const [selectedBranch, setSelectedBranch] = useState<SpecializationBranch | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const { data: character, isLoading: characterLoading } = useGetCharacterQuery(
    Number(characterId),
    { skip: !characterId }
  );

  const { data: specializationData } = useGetCharacterSpecializationQuery(
    Number(characterId),
    { skip: !characterId }
  );

  const { data: availableBranches } = useGetAvailableBranchesQuery(
    character?.class.toUpperCase() || '',
    { skip: !character }
  );

  const { data: abilitiesData } = useGetBranchAbilitiesQuery(
    selectedBranch || specializationData?.specialization?.branch || ('PALADIN' as SpecializationBranch),
    { skip: !selectedBranch && !specializationData?.specialization }
  );

  const [chooseBranch, { isLoading: isChoosing }] = useChooseBranchMutation();
  const [changeBranch, { isLoading: isChanging }] = useChangeBranchMutation();
  const [unlockTier, { isLoading: isUnlocking }] = useUnlockTierMutation();

  useEffect(() => {
    if (specializationData?.specialization) {
      setSelectedBranch(specializationData.specialization.branch);
    }
  }, [specializationData]);

  if (!characterId) {
    navigate('/');
    return null;
  }

  if (characterLoading) {
    return <div style={styles.loadingContainer}>Загрузка...</div>;
  }

  if (!character) {
    return (
      <div style={styles.errorContainer}>
        Персонаж не найден
        <br />
        <Link to="/dashboard">Назад</Link>
      </div>
    );
  }

  const handleChooseBranch = async () => {
    if (!selectedBranch || !characterId) return;

    try {
      await chooseBranch({
        characterId: Number(characterId),
        branch: selectedBranch,
      }).unwrap();
      setMessage({ text: 'Специализация выбрана!', type: 'success' });
    } catch (error: any) {
      setMessage({
        text: error?.data?.message || 'Ошибка выбора специализации',
        type: 'error',
      });
    }
  };

  const handleChangeBranch = async () => {
    if (!selectedBranch || !characterId) return;

    try {
      const result = await changeBranch({
        characterId: Number(characterId),
        newBranch: selectedBranch,
      }).unwrap();
      setMessage({ text: result.message, type: 'success' });
    } catch (error: any) {
      setMessage({
        text: error?.data?.message || 'Ошибка смены специализации',
        type: 'error',
      });
    }
  };

  const handleUnlockTier = async () => {
    if (!characterId) return;

    try {
      const result = await unlockTier({
        characterId: Number(characterId),
      }).unwrap();
      setMessage({ text: result.message, type: 'success' });
    } catch (error: any) {
      setMessage({
        text: error?.data?.message || 'Ошибка разблокировки тира',
        type: 'error',
      });
    }
  };

  const hasSpecialization = !!specializationData?.specialization;
  const canChoose = character.level >= 10 && !hasSpecialization;
  const canUnlock =
    hasSpecialization &&
    ((character.level >= 15 && !specializationData.specialization.tier2Unlocked) ||
      (character.level >= 20 &&
        specializationData.specialization.tier2Unlocked &&
        !specializationData.specialization.tier3Unlocked));

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Специализация</h1>

      {message && (
        <div style={message.type === 'success' ? styles.messageSuccess : styles.messageError}>
          {message.text}
        </div>
      )}

      <div style={styles.infoBlock}>
        <p>
          <strong>Уровень:</strong> {character.level}
        </p>
        <p>
          <strong>Класс:</strong> {character.class}
        </p>
        {hasSpecialization && (
          <>
            <p>
              <strong>Текущая специализация:</strong>{' '}
              {BRANCH_NAMES[specializationData.specialization.branch]}
            </p>
            <p>
              <strong>Разблокировано тиров:</strong>
              {' '}
              {specializationData.specialization.tier1Unlocked && '1'}
              {specializationData.specialization.tier2Unlocked && ', 2'}
              {specializationData.specialization.tier3Unlocked && ', 3'}
            </p>
          </>
        )}
        {!hasSpecialization && character.level < 10 && (
          <p style={{ color: '#e67e22' }}>
            Требуется уровень 10 для выбора специализации (текущий: {character.level})
          </p>
        )}
      </div>

      <h2>Доступные ветки</h2>
      <div style={styles.branchGrid}>
        {availableBranches?.branches.map((branch) => {
          const isSelected = selectedBranch === branch;
          const isCurrent = specializationData?.specialization?.branch === branch;
          const cardStyle = isCurrent
            ? styles.branchCardSelected
            : isSelected
            ? styles.branchCardSelected
            : hasSpecialization
            ? styles.branchCardDisabled
            : styles.branchCard;

          return (
            <div
              key={branch}
              style={cardStyle}
              onClick={() => {
                if (!hasSpecialization) {
                  setSelectedBranch(branch);
                }
              }}
            >
              <div style={styles.branchName}>
                {BRANCH_NAMES[branch]}
                {isCurrent && ' ⭐'}
              </div>
              <div style={styles.tierList}>
                {abilitiesData?.abilities
                  .filter((a) => a.branch === branch)
                  .map((ability) => {
                    const isUnlocked = hasSpecialization &&
                      ((ability.tier === 1 && specializationData.specialization.tier1Unlocked) ||
                        (ability.tier === 2 && specializationData.specialization.tier2Unlocked) ||
                        (ability.tier === 3 && specializationData.specialization.tier3Unlocked));

                    const tierLevelRequirement = ability.tier === 1 ? 10 : ability.tier === 2 ? 15 : 20;

                    return (
                      <div
                        key={ability.id}
                        style={
                          isUnlocked
                            ? styles.tierItemUnlocked
                            : isCurrent
                            ? styles.tierItemLocked
                            : styles.tierItem
                        }
                      >
                        <div style={styles.tierName}>
                          Tier {ability.tier}: {ability.name}
                          {isUnlocked && ' ✓'}
                          {!isUnlocked && isCurrent && ` (Требуется уровень ${tierLevelRequirement})`}
                        </div>
                        <div style={styles.tierDescription}>{ability.description}</div>
                        {ability.cooldown > 0 && (
                          <div style={{ ...styles.tierDescription, marginTop: '5px' }}>
                            Кулдаун: {ability.cooldown} ходов
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.buttonRow}>
        {canChoose && (
          <button
            style={selectedBranch ? styles.buttonPrimary : styles.buttonDisabled}
            onClick={handleChooseBranch}
            disabled={!selectedBranch || isChoosing}
          >
            {isChoosing ? 'Выбор...' : 'Выбрать специализацию'}
          </button>
        )}

        {hasSpecialization && selectedBranch !== specializationData.specialization.branch && (
          <button
            style={styles.buttonSecondary}
            onClick={handleChangeBranch}
            disabled={isChanging}
          >
            {isChanging ? 'Смена...' : 'Сменить за 1000 золота'}
          </button>
        )}

        {canUnlock && (
          <button
            style={styles.buttonPrimary}
            onClick={handleUnlockTier}
            disabled={isUnlocking}
          >
            {isUnlocking ? 'Разблокировка...' : 'Разблокировать тир'}
          </button>
        )}

        <Link to="/dashboard" style={{ textDecoration: 'none', marginLeft: 'auto' }}>
          <button style={styles.buttonDanger}>Назад</button>
        </Link>
      </div>
    </div>
  );
};

export default Specialization;
