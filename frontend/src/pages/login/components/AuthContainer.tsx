import { ReactNode } from 'react';

interface AuthContainerProps {
    children: ReactNode;
}

/**
 * Контейнер с рамкой и декоративными угловыми элементами
 * Используется внутри форм авторизации
 */
export function AuthContainer({ children }: AuthContainerProps) {
    return (
        <div className="relative w-full max-w-[700px]">
            {/* Decorative frames */}
            <div className="absolute -inset-4 border-2 border-amber-900/30 rounded-lg pointer-events-none"></div>
            <div className="absolute -inset-2 border border-amber-800/20 rounded-lg pointer-events-none"></div>

            <div className="border-2 border-amber-700/60 rounded-lg p-10 bg-gradient-to-b from-stone-950/95 to-black/95 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.9),inset_0_0_50px_rgba(0,0,0,0.5)] relative">
                {/* Corner ornaments */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-[3px] border-l-[3px] border-red-700/60 -translate-x-[2px] -translate-y-[2px]"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-[3px] border-r-[3px] border-red-700/60 translate-x-[2px] -translate-y-[2px]"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[3px] border-l-[3px] border-red-700/60 -translate-x-[2px] translate-y-[2px]"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[3px] border-r-[3px] border-red-700/60 translate-x-[2px] translate-y-[2px]"></div>

                {/* Content */}
                {children}
            </div>
        </div>
    );
}