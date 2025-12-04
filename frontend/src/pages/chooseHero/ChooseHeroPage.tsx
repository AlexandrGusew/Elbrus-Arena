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

            {/* Character Slots */}
            <div className="grid grid-cols-3 gap-5 mb-8 w-full max-w-[1100px]">
                {slots.map((character, index) => (
                    <div key={index} className="relative group">
                        <div className="absolute -inset-2 border border-amber-900/20 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="border-2 border-amber-700/60 rounded-lg p-5 bg-gradient-to-b from-stone-950/95 to-black/95 backdrop-blur-md hover:border-amber-600/80 hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] transition-all cursor-pointer relative h-full min-h-[320px]">
                            {/* Corner ornaments */}
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-700/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-700/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-700/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-700/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {character ? (
                                <div
                                    onClick={() => handleSelectCharacter(character)}
                                    className="flex flex-col items-center"
                                >
                                    <div className="w-40 h-40 rounded-full border-[3px] border-amber-700/60 bg-gradient-to-br from-red-950/60 via-stone-900 to-black flex items-center justify-center mb-3 relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] group-hover:border-amber-600/80 group-hover:scale-105 transition-all">
                                        {/* Glowing eyes */}
                                        <div className="absolute top-14 left-12 w-3 h-3 rounded-full bg-red-600 blur-sm animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.9)]"></div>
                                        <div
                                            className="absolute top-14 right-12 w-3 h-3 rounded-full bg-red-600 blur-sm animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.9)]"
                                            style={{ animationDelay: '0.5s' }}
                                        ></div>

                                        <span className="text-6xl filter drop-shadow-[0_0_12px_rgba(251,191,36,0.6)] transition-transform">
                                            {CLASS_ICONS[character.class.toLowerCase()] || '⚔️'}
                                        </span>

                                        {/* Level badge */}
                                        <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full border-2 border-amber-600/80 bg-gradient-to-br from-red-950 to-black flex items-center justify-center text-amber-200 text-sm shadow-lg">
                                            {character.level}
                                        </div>

                                        {/* Animated ring */}
                                        <div className="absolute inset-1 rounded-full border border-amber-500/20 animate-pulse"></div>
                                    </div>

                                    <div className="border-2 border-amber-800/40 rounded px-6 py-2 bg-gradient-to-b from-stone-950/80 to-black/90 mb-2 text-center text-amber-200 tracking-[0.15em] uppercase text-sm shadow-inner font-serif">
                                        {character.name}
                                    </div>

                                    <div className="px-4 py-1 border border-amber-900/30 rounded bg-stone-950/50 text-amber-400/80 text-xs tracking-wider uppercase">
                                        {character.class} - Level {character.level}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={handleCreateNew}
                                    className="flex flex-col items-center justify-center h-full"
                                >
                                    <div className="w-40 h-40 rounded-full border-2 border-dashed border-amber-700/40 bg-gradient-to-br from-stone-950/40 to-black/40 flex items-center justify-center mb-3 hover:border-amber-600/60 hover:bg-gradient-to-br hover:from-red-950/30 hover:to-stone-900/40 transition-all group-hover:scale-105">
                                        <Plus className="w-12 h-12 text-amber-700/50 group-hover:text-amber-500/70 transition-colors" />
                                    </div>

                                    <div className="px-6 py-2 border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/60 to-black/80 hover:from-red-950/60 hover:to-red-900/60 hover:border-amber-700/60 text-amber-300 transition-all tracking-[0.15em] uppercase text-sm font-serif">
                                        Create New
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

        </AuthLayout>
    );
}