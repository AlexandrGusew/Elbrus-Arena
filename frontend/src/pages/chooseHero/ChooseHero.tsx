import { Volume2, VolumeX, ArrowLeft, Plus } from 'lucide-react';

interface ChooseCharacterPageProps {
    onNavigate: (page: 'login' | 'create' | 'choose') => void;
    musicOn: boolean;
    onToggleMusic: () => void;
}

interface Character {
    id: number;
    name: string;
    class: string;
    level: number;
    icon: string;
}

export function ChooseCharacterPage({ onNavigate, musicOn, onToggleMusic }: ChooseCharacterPageProps) {
    const character: Character = { id: 1, name: 'Darkmoon', class: 'Warrior', level: 12, icon: '⚔️' };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center px-12 py-6 relative">
            {/* Header Controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between z-20">
                <button
                    onClick={() => onNavigate('login')}
                    className="px-5 py-2 border-2 border-amber-700/60 rounded bg-gradient-to-b from-stone-900/80 to-black/90 hover:from-stone-800/80 hover:to-stone-900/90 text-amber-300 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(217,119,6,0.2)] backdrop-blur-sm tracking-wider text-sm uppercase"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Exit
                </button>
                <button
                    onClick={onToggleMusic}
                    className="px-5 py-2 border-2 border-amber-700/60 rounded bg-gradient-to-b from-stone-900/80 to-black/90 hover:from-stone-800/80 hover:to-stone-900/90 text-amber-300 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(217,119,6,0.2)] backdrop-blur-sm tracking-wider text-sm uppercase"
                >
                    {musicOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    <span>Music {musicOn ? 'On' : 'Off'}</span>
                </button>
            </div>

            {/* Title */}
            <div className="mb-8 relative">
                <h1 className="text-5xl tracking-[0.15em] uppercase" style={{
                    fontFamily: 'serif',
                    textShadow: '0 0 20px rgba(217, 119, 6, 0.8), 0 0 40px rgba(217, 119, 6, 0.4)',
                    background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    Choose Character
                </h1>
                <div className="flex items-center justify-center mt-2 gap-2">
                    <div className="w-8 h-[2px] bg-gradient-to-r from-transparent to-amber-700/50"></div>
                    <div className="w-1 h-1 rotate-45 border border-amber-600/50"></div>
                    <div className="w-16 h-[1px] bg-amber-700/30"></div>
                    <div className="w-1 h-1 rotate-45 border border-amber-600/50"></div>
                    <div className="w-8 h-[2px] bg-gradient-to-l from-transparent to-amber-700/50"></div>
                </div>
            </div>

            {/* Character Card */}
            <div className="mb-8 flex justify-center">
                <div className="w-[353px] p-5 relative group cursor-pointer">
                    {/* Avatar Circle: 160x160 + 3px border */}
                    <div className="w-40 h-40 mx-auto rounded-full border-[3px] border-amber-700/60 bg-gradient-to-br from-red-950/60 via-stone-900 to-black flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
                        {/* Glowing eyes: 12px, 56px from top, 48px from edge */}
                        <div className="absolute w-3 h-3 rounded-full bg-red-600 blur-sm animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.9)]" style={{ top: '56px', left: '48px' }}></div>
                        <div className="absolute w-3 h-3 rounded-full bg-red-600 blur-sm animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.9)]" style={{ top: '56px', right: '48px', animationDelay: '0.5s' }}></div>

                        <span className="text-6xl filter drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">{character.icon}</span>

                        {/* Level badge: 32px */}
                        <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full border-2 border-amber-600/80 bg-gradient-to-br from-red-950 to-black flex items-center justify-center text-amber-200 text-sm shadow-lg">
                            {character.level}
                        </div>
                    </div>

                    {/* 12px gap */}
                    <div className="h-3"></div>

                    {/* NAME: 32px height */}
                    <div className="h-8 border-2 border-amber-800/40 rounded px-6 bg-gradient-to-b from-stone-950/80 to-black/90 flex items-center justify-center text-amber-200 tracking-[0.15em] uppercase text-sm shadow-inner" style={{ fontFamily: 'serif' }}>
                        {character.name}
                    </div>

                    {/* 8px gap */}
                    <div className="h-2"></div>

                    {/* CLASS - Level: 22px height */}
                    <div className="h-[22px] px-4 border border-amber-900/30 rounded bg-stone-950/50 flex items-center justify-center text-amber-400/80 text-xs tracking-wider uppercase">
                        {character.class} - Level {character.level}
                    </div>
                </div>
            </div>

            {/* Start Button */}
            <div className="relative">
                <div className="absolute -inset-3 border border-amber-900/30 rounded-lg pointer-events-none"></div>
                <div className="absolute -inset-1 border border-amber-800/20 rounded-lg pointer-events-none"></div>

                <div
                    onClick={() => onNavigate('dashboard')}
                    className="border-2 border-amber-700/60 rounded-lg px-20 py-6 bg-gradient-to-b from-stone-950/95 to-black/95 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.8)] relative group hover:border-red-700/70 transition-all cursor-pointer"
                >
                    {/* Corner ornaments */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-red-700/0 group-hover:border-red-700/70 transition-all"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-red-700/0 group-hover:border-red-700/70 transition-all"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-red-700/0 group-hover:border-red-700/70 transition-all"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-red-700/0 group-hover:border-red-700/70 transition-all"></div>

                    {/* Glowing effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-red-600/0 via-red-600/0 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>

                    <button className="text-4xl uppercase tracking-[0.2em] relative z-10 transition-all" style={{
                        fontFamily: 'serif',
                        textShadow: '0 0 15px rgba(217, 119, 6, 0.6)',
                        background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Enter Realm
                    </button>
                </div>
            </div>
        </div>
    );
}