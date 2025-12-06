import { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { getAssetUrl } from '../../../utils/assetUrl';

interface LoginFormProps {
    onSubmit: (username: string, password: string) => void;
    isLoading?: boolean;
}

interface FieldErrors {
    username?: string;
    password?: string;
}

export function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<FieldErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Валидация username
    const validateUsername = (value: string): string | undefined => {
        if (!value) {
            return 'Введите логин';
        }
        if (value.length < 3) {
            return 'Минимум 3 символа';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            return 'Только латиница, цифры и _';
        }
        return undefined;
    };

    // Валидация password
    const validatePassword = (value: string): string | undefined => {
        if (!value) {
            return 'Введите пароль';
        }
        if (value.length < 6) {
            return 'Минимум 6 символов';
        }
        return undefined;
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUsername(value);
        if (touched.username) {
            setErrors(prev => ({ ...prev, username: validateUsername(value) }));
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        if (touched.password) {
            setErrors(prev => ({ ...prev, password: validatePassword(value) }));
        }
    };

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));

        if (field === 'username') {
            setErrors(prev => ({ ...prev, username: validateUsername(username) }));
        } else if (field === 'password') {
            setErrors(prev => ({ ...prev, password: validatePassword(password) }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Отметить все поля как touched
        setTouched({ username: true, password: true });

        // Валидация всех полей
        const usernameError = validateUsername(username);
        const passwordError = validatePassword(password);

        setErrors({
            username: usernameError,
            password: passwordError,
        });

        // Если есть ошибки - не отправляем
        if (usernameError || passwordError) {
            return;
        }

        onSubmit(username, password);
    };

    const getInputClassName = (field: keyof FieldErrors) => {
        const baseClass = "w-full px-6 py-3 border-2 rounded bg-gradient-to-b from-stone-950/80 to-black/90 text-amber-200 placeholder:text-amber-900/50 placeholder:tracking-[0.2em] focus:outline-none transition-all tracking-wider disabled:opacity-50";

        if (!touched[field]) {
            return `${baseClass} border-amber-800/40 focus:border-amber-600/80 focus:shadow-[0_0_20px_rgba(217,119,6,0.3)]`;
        }

        if (errors[field]) {
            return `${baseClass} border-red-700/80 focus:border-red-600 focus:shadow-[0_0_20px_rgba(220,38,38,0.5)]`;
        }

        return `${baseClass} border-green-700/60 focus:border-green-600/80 focus:shadow-[0_0_20px_rgba(34,197,94,0.3)]`;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="relative">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="LOGIN"
                        value={username}
                        onChange={handleUsernameChange}
                        onBlur={() => handleBlur('username')}
                        disabled={isLoading}
                        className={getInputClassName('username')}
                        style={{ fontFamily: 'serif' }}
                    />
                    {touched.username && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {errors.username ? (
                                <AlertCircle className="w-5 h-5 text-red-400" />
                            ) : (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                            )}
                        </div>
                    )}
                </div>
                {touched.username && errors.username && (
                    <p className="mt-1.5 text-red-400 text-xs tracking-wide flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.username}
                    </p>
                )}
            </div>

            {/* Password Field */}
            <div className="relative">
                <div className="relative group">
                    <input
                        type="password"
                        placeholder="PASSWORD"
                        value={password}
                        onChange={handlePasswordChange}
                        onBlur={() => handleBlur('password')}
                        disabled={isLoading}
                        className={getInputClassName('password')}
                        style={{ fontFamily: 'serif' }}
                    />
                    {touched.password && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {errors.password ? (
                                <AlertCircle className="w-5 h-5 text-red-400" />
                            ) : (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                            )}
                        </div>
                    )}
                </div>
                {touched.password && errors.password && (
                    <p className="mt-1.5 text-red-400 text-xs tracking-wide flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.password}
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
                        backgroundImage: `url(${getAssetUrl('login/enterButton.png')})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    <span className="relative z-10">{isLoading ? 'Loading...' : ''}</span>
                    {!isLoading && <div className="absolute inset-0 bg-gradient-to-t from-red-600/0 via-red-600/20 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                </button>
            </div>
        </form>
    );
}