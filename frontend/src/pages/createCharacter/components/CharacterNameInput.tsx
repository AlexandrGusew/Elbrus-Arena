import { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { getAssetUrl } from '../../../utils/assetUrl';

interface CharacterNameInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isLoading?: boolean;
}

/**
 * Компонент ввода имени персонажа с валидацией
 * Отображает фоновое изображение и поле ввода с валидацией
 */
export function CharacterNameInput({ value, onChange, onSubmit, isLoading = false }: CharacterNameInputProps) {
    const [touched, setTouched] = useState(false);

    const validateName = (name: string): string | undefined => {
        if (!name.trim()) return 'Введите имя персонажа';
        if (name.trim().length < 3) return 'Минимум 3 символа';
        if (name.trim().length > 20) return 'Максимум 20 символов';
        if (!/^[a-zA-Zа-яА-Я0-9\s_-]+$/.test(name)) return 'Только буквы, цифры, пробелы, _ и -';
        return undefined;
    };

    const error = validateName(value);
    const isValid = !error && value.trim().length > 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
    };

    const handleBlur = () => {
        setTouched(true);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading && isValid) {
            onSubmit();
        }
    };

    return (
        <div className="relative w-[500px] h-[180px] flex items-center justify-center mb-6 z-[2]">
            {/* Фоновое изображение свитка */}
            <img
                src={getAssetUrl('createCharacter/enterName (1).png')}
                alt="Enter Name"
                className="absolute w-full h-full object-cover z-[2]"
            />

            {/* Поле ввода */}
            <div className="relative z-[3] w-full flex items-center justify-center">
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    maxLength={20}
                    placeholder=""
                    className="absolute w-[45%] px-6 py-3 text-[24px] font-bold text-center border-none bg-transparent text-black rounded-lg outline-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 disabled:opacity-50"
                    style={{
                        fontFamily: 'Arial, sans-serif',
                        caretColor: '#000',
                    }}
                />

                {/* Иконка валидации - внутри свитка */}
                {touched && value.trim() && (
                    <div className="absolute right-[24%] top-1/2 -translate-y-1/2 z-[4]">
                        {isValid ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                    </div>
                )}
            </div>

            {/* Сообщение об ошибке */}
            {touched && error && (
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-red-900/80 border border-red-700/60 rounded text-amber-200 text-xs flex items-center gap-2 whitespace-nowrap z-[4]">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </div>
            )}
        </div>
    );
}