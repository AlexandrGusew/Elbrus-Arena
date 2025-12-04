interface ModeOption {
    value: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface AuthModeSwitchProps {
    modes: ModeOption[];
    activeMode: string;
    onChange: (mode: string) => void;
}

/**
 * Универсальный компонент для переключения между режимами авторизации
 * Поддерживает любое количество кнопок с иконками
 */
export function AuthModeSwitch({ modes, activeMode, onChange }: AuthModeSwitchProps) {
    return (
        <div className="flex gap-3 mb-8">
            {modes.map(({ value, label, icon: Icon }) => {
                const isActive = activeMode === value;

                return (
                    <button
                        key={value}
                        onClick={() => onChange(value)}
                        className={`flex-1 px-6 py-3 border-2 rounded transition-all tracking-[0.2em] uppercase text-sm relative overflow-hidden group font-serif ${
                            isActive
                                ? 'border-red-700/80 bg-gradient-to-b from-red-950/80 to-red-900/80 shadow-[0_0_20px_rgba(127,29,29,0.6)]'
                                : 'border-amber-800/40 bg-gradient-to-b from-stone-900/60 to-stone-950/60 text-amber-300/60 hover:text-amber-200 hover:border-amber-700/60'
                        }`}
                    >
                        <span className={`relative z-10 flex items-center justify-center gap-2 ${isActive ? 'text-gradient-gold' : ''}`}>
                            <Icon size={16} className={isActive ? 'animate-pulse' : ''} />
                            <span className="font-bold">{label}</span>
                        </span>
                        {!isActive && (
                            <div className="absolute inset-0 bg-gradient-to-b from-amber-900/0 to-amber-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}