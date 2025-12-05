import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CharacterClass } from '../../../types/api';
import { getAssetUrl } from '../../../utils/assetUrl';

const CLASS_INFO: Record<CharacterClass, { name: string; image: string; description: string }> = {
    warrior: {
        name: 'Воин',
        image: getAssetUrl('createCharacter/warrior (1).png'),
        description: 'Мастер ближнего боя с высокой защитой',
    },
    mage: {
        name: 'Маг',
        image: getAssetUrl('createCharacter/mage (1).png'),
        description: 'Повелитель магических сил и заклинаний',
    },
    rogue: {
        name: 'Разбойник',
        image: getAssetUrl('createCharacter/rogue (1).png'),
        description: 'Быстрый и ловкий мастер скрытности',
    },
};

const CLASS_ORDER: CharacterClass[] = ['warrior', 'mage', 'rogue'];

interface ClassSelectorProps {
    selectedClass: CharacterClass | null;
    onSelectClass: (cls: CharacterClass) => void;
}

/**
 * Компонент выбора класса персонажа со стрелками навигации
 * Переключение между классами стрелками влево-вправо
 */
export function ClassSelector({ selectedClass, onSelectClass }: ClassSelectorProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentClass = CLASS_ORDER[currentIndex];

    const handlePrevClass = () => {
        const newIndex = currentIndex === 0 ? CLASS_ORDER.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
        onSelectClass(CLASS_ORDER[newIndex]);
    };

    const handleNextClass = () => {
        const newIndex = currentIndex === CLASS_ORDER.length - 1 ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
        onSelectClass(CLASS_ORDER[newIndex]);
    };

    return (
        <div className="flex items-center gap-6 mb-4 relative z-[2]">
            {/* Кнопка "Назад" */}
            <button
                onClick={handlePrevClass}
                className="p-4 border-2 border-amber-800/60 rounded-full bg-gradient-to-b from-stone-900/80 to-black/90 hover:from-stone-800/80 hover:to-stone-900/90 text-amber-400 hover:text-amber-300 hover:border-amber-700/80 transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(217,119,6,0.3)]"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Декоративные полоски слева */}
            <div className="flex flex-col items-center gap-3">
                <div className="w-[2px] h-12 bg-gradient-to-b from-transparent to-amber-700/50"></div>
                <div className="w-[1px] h-8 bg-amber-700/30"></div>
            </div>

            {/* Изображение класса БЕЗ рамки и описания */}
            <div className="relative">
                <div className="w-[340px] h-[400px] rounded-lg overflow-hidden relative transition-all duration-300">
                    <img
                        src={CLASS_INFO[currentClass].image}
                        alt={CLASS_INFO[currentClass].name}
                        className="w-full h-full object-cover"
                        style={{
                            filter: 'brightness(1.1) drop-shadow(0 0 20px rgba(255, 253, 208, 0.4))',
                        }}
                    />
                </div>

                {/* Индикаторы классов */}
                <div className="flex justify-center gap-2 mt-3">
                    {CLASS_ORDER.map((cls, index) => (
                        <div
                            key={cls}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === currentIndex
                                    ? 'bg-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-125'
                                    : 'bg-amber-900/40 hover:bg-amber-700/60'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Декоративные полоски справа */}
            <div className="flex flex-col items-center gap-3">
                <div className="w-[2px] h-12 bg-gradient-to-b from-transparent to-amber-700/50"></div>
                <div className="w-[1px] h-8 bg-amber-700/30"></div>
            </div>

            {/* Кнопка "Вперед" */}
            <button
                onClick={handleNextClass}
                className="p-4 border-2 border-amber-800/60 rounded-full bg-gradient-to-b from-stone-900/80 to-black/90 hover:from-stone-800/80 hover:to-stone-900/90 text-amber-400 hover:text-amber-300 hover:border-amber-700/80 transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(217,119,6,0.3)]"
            >
                <ChevronRight className="w-8 h-8" />
            </button>
        </div>
    );
}