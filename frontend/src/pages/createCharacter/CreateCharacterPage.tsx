import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CharacterClass } from '../../types/api';
import { useCreateCharacterMutation } from '../../store/api/characterApi';
import { AuthLayout } from '../login/components/AuthLayout';
import { ClassSelector } from './components/ClassSelector';
import { CharacterNameInput } from './components/CharacterNameInput';

/**
 * CREATE CHARACTER PAGE - Страница создания персонажа
 * Размер экрана: 1440x1080
 */
export function CreateCharacterPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
    const [error, setError] = useState('');

    // API mutations
    const [createCharacter, { isLoading }] = useCreateCharacterMutation();

    const handleCreate = async () => {
        // Валидация
        if (!name.trim()) {
            setError('Введите имя персонажа');
            return;
        }

        if (name.trim().length < 3) {
            setError('Минимум 3 символа');
            return;
        }

        if (!selectedClass) {
            setError('Выберите класс персонажа');
            return;
        }

        setError('');

        try {
            await createCharacter({
                name: name.trim(),
                class: selectedClass,
            }).unwrap();

            // После создания → возврат на страницу выбора героя
            navigate('/choose-hero');
        } catch (err: any) {
            console.error('Create character error:', err);
            setError(err.data?.message || err.message || 'Ошибка при создании персонажа');
        }
    };

    const handleBack = () => {
        navigate('/choose-hero');
    };

    return (
        <AuthLayout showBackButton={true} onBack={handleBack}>
            {/* Global Error Message */}
            {error && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-900/80 border border-red-700/60 rounded text-amber-200 text-sm text-center z-10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                    {error}
                </div>
            )}

            {/* Центрированный контент */}
            <div className="flex flex-col items-center justify-center gap-2">
                {/* Character Name Input - Свиток сверху */}
                <CharacterNameInput value={name} onChange={setName} onSubmit={handleCreate} isLoading={isLoading} />

                {/* Class Selection */}
                <ClassSelector selectedClass={selectedClass} onSelectClass={setSelectedClass} />

                {/* Create Button - уменьшенная */}
                <button
                    onClick={handleCreate}
                    disabled={isLoading || !name.trim() || !selectedClass}
                    className="relative px-20 py-4 border-2 border-amber-800/70 rounded-xl bg-gradient-to-b from-stone-900/90 to-black/90 hover:from-stone-800/90 hover:to-stone-900/90 text-amber-100 hover:border-amber-600/80 hover:shadow-[0_0_25px_rgba(217,119,6,0.4)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed text-xl tracking-[0.2em] uppercase font-serif z-[2] mt-6"
                >
                    <span className="relative z-10 text-gradient-gold">Create Character</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-600/0 via-amber-600/0 to-amber-600/10 opacity-0 hover:opacity-100 transition-opacity rounded-xl"></div>
                </button>
            </div>
        </AuthLayout>
    );
}