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
            <div className="p-10 relative">
                {/* Content */}
                {children}
            </div>
        </div>
    );
}