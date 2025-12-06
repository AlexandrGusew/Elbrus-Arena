import { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import openBot from '../images/openBot.png';
import enterButton from '../images/enterButton.png';

// Telegram bot username
const TELEGRAM_BOT_USERNAME = 'login_nightfall_bot';

interface TelegramAuthProps {
    onInitiate: (telegramUsername: string) => void;
    onVerifyCode: (telegramUsername: string, code: string) => void;
    isLoading?: boolean;
}

export function TelegramAuth({ onInitiate, onVerifyCode, isLoading = false }: TelegramAuthProps) {
    const [telegramUsername, setTelegramUsername] = useState('');
    const [code, setCode] = useState('');
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [errors, setErrors] = useState<{ telegramUsername?: string; code?: string }>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Валидация telegram username
    const validateTelegramUsername = (value: string): string | undefined => {
        if (!value) {
            return 'Введите Telegram логин';
        }
        if (value.length < 2) {
            return 'Минимум 2 символа';
        }
        if (value.startsWith('@')) {
            return 'Уберите символ @';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            return 'Только латиница, цифры и _';
        }
        return undefined;
    };

    // Валидация code
    const validateCode = (value: string): string | undefined => {
        if (!value) {
            return 'Введите код';
        }
        if (value.length !== 6) {
            return 'Код должен быть 6 цифр';
        }
        if (!/^\d{6}$/.test(value)) {
            return 'Только цифры';
        }
        return undefined;
    };

    const handleTelegramUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTelegramUsername(value);
        if (touched.telegramUsername) {
            setErrors(prev => ({ ...prev, telegramUsername: validateTelegramUsername(value) }));
        }
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Только цифры
        setCode(value);
        if (touched.code) {
            setErrors(prev => ({ ...prev, code: validateCode(value) }));
        }
    };

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));

        if (field === 'telegramUsername') {
            setErrors(prev => ({ ...prev, telegramUsername: validateTelegramUsername(telegramUsername) }));
        } else if (field === 'code') {
            setErrors(prev => ({ ...prev, code: validateCode(code) }));
        }
    };

    const handleInitiate = () => {
        setTouched({ telegramUsername: true });

        const usernameError = validateTelegramUsername(telegramUsername);
        setErrors({ telegramUsername: usernameError });

        if (usernameError) {
            return;
        }

        // Открываем бота в Telegram
        const link = document.createElement('a');
        link.href = `tg://resolve?domain=${TELEGRAM_BOT_USERNAME}`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Инициируем авторизацию на бэкенде
        onInitiate(telegramUsername);
        setShowCodeInput(true);
    };

    const handleVerifyCode = (e: React.FormEvent) => {
        e.preventDefault();

        setTouched({ code: true });

        const codeError = validateCode(code);
        setErrors({ code: codeError });

        if (codeError) {
            return;
        }

        onVerifyCode(telegramUsername, code);
    };

    const getInputClassName = (field: string) => {
        const baseClass = "w-full px-6 py-3 border-2 rounded bg-gradient-to-b from-stone-950/80 to-black/90 text-amber-200 placeholder:text-amber-900/50 placeholder:tracking-[0.2em] focus:outline-none transition-all tracking-wider disabled:opacity-50";

        if (!touched[field]) {
            return `${baseClass} border-amber-800/40 focus:border-amber-600/80 focus:shadow-[0_0_20px_rgba(217,119,6,0.3)]`;
        }

        if (errors[field as keyof typeof errors]) {
            return `${baseClass} border-red-700/80 focus:border-red-600 focus:shadow-[0_0_20px_rgba(220,38,38,0.5)]`;
        }

        return `${baseClass} border-green-700/60 focus:border-green-600/80 focus:shadow-[0_0_20px_rgba(34,197,94,0.3)]`;
    };

    if (!showCodeInput) {
        // Форма ввода Telegram username
        return (
            <div className="space-y-5">
                <div className="text-center mb-4">
                    <p className="text-amber-400/70 text-sm tracking-wider">
                        Введите ваш Telegram username <br />
                        (без символа @)
                    </p>
                </div>

                {/* Telegram Username Field */}
                <div className="relative">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="TELEGRAM USERNAME"
                            value={telegramUsername}
                            onChange={handleTelegramUsernameChange}
                            onBlur={() => handleBlur('telegramUsername')}
                            disabled={isLoading}
                            className={getInputClassName('telegramUsername')}
                            style={{ fontFamily: 'serif' }}
                        />
                        {touched.telegramUsername && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {errors.telegramUsername ? (
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                ) : (
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                )}
                            </div>
                        )}
                    </div>
                    {touched.telegramUsername && errors.telegramUsername && (
                        <p className="mt-1.5 text-red-400 text-xs tracking-wide flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.telegramUsername}
                        </p>
                    )}
                </div>

                <div className="flex justify-center pt-6">
                    <button
                        type="button"
                        onClick={handleInitiate}
                        disabled={isLoading}
                        className="relative px-20 py-4 rounded bg-gradient-to-b from-red-950/90 to-red-900/90 hover:from-red-900/90 hover:to-red-800/90 text-amber-200 transition-all tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(127,29,29,0.5)] hover:shadow-[0_0_40px_rgba(127,29,29,0.7)] group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            fontFamily: 'serif',
                            backgroundImage: `url(${openBot})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}
                    >
                        <span className="relative z-10"></span>
                        {!isLoading && <div className="absolute inset-0 bg-gradient-to-t from-red-600/0 via-red-600/20 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                    </button>
                </div>
            </div>
        );
    }

    // Форма ввода кода
    return (
        <form onSubmit={handleVerifyCode} className="space-y-5">
            <div className="text-center mb-4">
                <p className="text-amber-400/70 text-sm tracking-wider">
                    Откройте бот @{TELEGRAM_BOT_USERNAME} <br />
                    и введите полученный код
                </p>
            </div>

            {/* Code Field */}
            <div className="relative">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="CODE (6 digits)"
                        value={code}
                        onChange={handleCodeChange}
                        onBlur={() => handleBlur('code')}
                        maxLength={6}
                        disabled={isLoading}
                        autoFocus
                        className={`${getInputClassName('code')} text-center text-2xl`}
                        style={{ fontFamily: 'serif' }}
                    />
                    {touched.code && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {errors.code ? (
                                <AlertCircle className="w-5 h-5 text-red-400" />
                            ) : (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                            )}
                        </div>
                    )}
                </div>
                {touched.code && errors.code && (
                    <p className="mt-1.5 text-red-400 text-xs tracking-wide flex items-center gap-1 justify-center">
                        <AlertCircle className="w-3 h-3" />
                        {errors.code}
                    </p>
                )}
            </div>

            <div className="flex justify-center pt-6">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="relative px-20 py-4 rounded bg-gradient-to-b from-red-950/90 to-red-900/90 hover:from-red-900/90 hover:to-red-800/90 text-amber-200 transition-all tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(127,29,29,0.5)] hover:shadow-[0_0_40px_rgba(127,29,29,0.7)] group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        fontFamily: 'serif',
                        backgroundImage: `url(${enterButton})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    <span className="relative z-10">{isLoading ? 'Verifying...' : ''}</span>
                    {!isLoading && <div className="absolute inset-0 bg-gradient-to-t from-red-600/0 via-red-600/20 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                </button>
            </div>

            <div className="text-center pt-2">
                <button
                    type="button"
                    onClick={() => {
                        setShowCodeInput(false);
                        setCode('');
                        setErrors({});
                        setTouched({});
                    }}
                    className="text-amber-600/70 hover:text-amber-500 text-sm tracking-wider transition-colors"
                >
                    ← Назад
                </button>
            </div>
        </form>
    );
}