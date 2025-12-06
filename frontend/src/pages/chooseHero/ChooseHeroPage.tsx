import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AuthLayout } from '../login/components/AuthLayout';
import { useGetMyCharacterQuery } from '../../store/api/characterApi';
import type { Character } from '../../types/api';

/**
 * CHOOSE HERO PAGE - Страница выбора персонажа
 * Показывает до 3 слотов персонажей
 * Пустые слоты = кнопка "Create New"
 */
export function ChooseHeroPage() {
    const navigate = useNavigate();
    const { data: character, isLoading } = useGetMyCharacterQuery();

    // Заполняем массив до 3 слотов (1 персонаж если есть + пустые слоты)
    const slots: (Character | null)[] = character
        ? [character, null, null]
        : [null, null, null];

    const handleSelectCharacter = (character: Character) => {
        localStorage.setItem('characterId', character.id.toString());
        navigate('/dashboard');
    };

    const handleCreateNew = () => {
        navigate('/create-character');
    };

    const handleExit = () => {
        // Выход - очистка токена и редирект на login
        localStorage.removeItem('token');
        localStorage.removeItem('characterId');
        navigate('/login');
    };

    const CLASS_ICONS: Record<string, string> = {
        warrior: '⚔️',
        mage: '🔮',
        rogue: '🗡️',
    };

    if (isLoading) {
        return (
            <AuthLayout>
                <div className="text-amber-400 text-xl tracking-wider">Loading...</div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout showExitButton={true} onExit={handleExit}>
            {/* Title */}
            <div className="mb-8 relative">
                <h1 className="text-7xl tracking-[0.15em] uppercase text-gradient-gold-intense font-serif">
                    Choose Hero
                </h1>

                {/* Ornamental line */}
                <div className="flex items-center justify-center mt-4 gap-2">
                    <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-amber-700/50"></div>
                    <div className="w-2 h-2 rotate-45 border border-amber-600/50"></div>
                    <div className="w-24 h-[1px] bg-amber-700/30"></div>
                    <div className="w-2 h-2 rotate-45 border border-amber-600/50"></div>
                    <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-amber-700/50"></div>
                </div>
            </div>

            {/* Character Card - Single slot, 353px width */}
            <div className="flex justify-center mb-8">
                <div
                    onClick={character ? () => handleSelectCharacter(character) : handleCreateNew}
                    className="w-[353px] p-5 relative cursor-pointer"
                >
                    {/* Avatar Circle: 160x160 + 3px border */}
                    <div className="w-40 h-40 mx-auto rounded-full border-[3px] border-amber-700/60 bg-gradient-to-br from-red-950/60 via-stone-900 to-black flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
                        {character ? (
                            <>
                                {/* Glowing eyes: 12px, 56px from top, 48px from edge */}
                                <div className="absolute w-3 h-3 rounded-full bg-red-600 blur-sm animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.9)]" style={{ top: '56px', left: '48px' }}></div>
                                <div className="absolute w-3 h-3 rounded-full bg-red-600 blur-sm animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.9)]" style={{ top: '56px', right: '48px', animationDelay: '0.5s' }}></div>

                                <span className="text-6xl filter drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
                                    {CLASS_ICONS[character.class.toLowerCase()] || '⚔️'}
                                </span>

                                {/* Level badge: 32px */}
                                <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full border-2 border-amber-600/80 bg-gradient-to-br from-red-950 to-black flex items-center justify-center text-amber-200 text-sm shadow-lg">
                                    {character.level}
                                </div>
                            </>
                        ) : (
                            <Plus className="w-12 h-12 text-amber-700/50" />
                        )}
                    </div>

                    {/* 12px gap */}
                    <div className="h-3"></div>

                    {/* NAME: 32px height */}
                    <div className="h-8 border-2 border-amber-800/40 rounded px-6 bg-gradient-to-b from-stone-950/80 to-black/90 flex items-center justify-center text-amber-200 tracking-[0.15em] uppercase text-sm shadow-inner font-serif">
                        {character ? character.name : 'Create New'}
                    </div>

                    {/* 8px gap */}
                    <div className="h-2"></div>

                    {/* CLASS - Level: 22px height */}
                    <div className="h-[22px] px-4 border border-amber-900/30 rounded bg-stone-950/50 flex items-center justify-center text-amber-400/80 text-xs tracking-wider uppercase">
                        {character ? `${character.class} - Level ${character.level}` : 'No Character'}
                    </div>
                </div>
            </div>

        </AuthLayout>
    );
}