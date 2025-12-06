import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Send } from 'lucide-react';
import { AuthLayout } from './components/AuthLayout';
import { AuthContainer } from './components/AuthContainer';
import { AuthModeSwitch } from './components/AuthModeSwitch';
import { RegisterForm } from './components/RegisterForm';
import { TelegramAuth } from './components/TelegramAuth';
import {
    useRegisterMutation,
    useInitiateTelegramAuthMutation,
    useVerifyTelegramCodeMutation,
} from '../../store/api/authApi';

/**
 * REGISTER PAGE - Страница регистрации
 * Размер экрана: 1440x1080
 */

type AuthMode = 'register' | 'telegram';

export function RegisterPage() {
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState<AuthMode>('register');
    const [error, setError] = useState('');

    // API mutations
    const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
    const [initiateTelegramAuth] = useInitiateTelegramAuthMutation();
    const [verifyTelegramCode, { isLoading: isVerifyLoading }] = useVerifyTelegramCodeMutation();

    // После успешной регистрации → редирект на выбор героя
    const handleAuthSuccess = async () => {
        navigate('/choose-hero');
    };

    // Обработчики форм
    const handleRegister = async (username: string, password: string) => {
        try {
            setError('');
            await register({ username, password }).unwrap();
            await handleAuthSuccess();
        } catch (err: any) {
            console.error('Register error:', err);
            setError(err.data?.message || 'Ошибка регистрации');
        }
    };

    const handleTelegramInitiate = async (telegramUsername: string) => {
        try {
            setError('');
            await initiateTelegramAuth({ telegramUsername }).unwrap();
        } catch (err: any) {
            console.error('Telegram initiate error:', err);
            setError(err.data?.message || 'Ошибка инициации Telegram');
        }
    };

    const handleTelegramVerify = async (telegramUsername: string, code: string) => {
        try {
            setError('');
            await verifyTelegramCode({ telegramUsername, code }).unwrap();
            await handleAuthSuccess();
        } catch (err: any) {
            console.error('Telegram verify error:', err);
            setError(err.data?.message || 'Неверный или истекший код');
        }
    };

    const modes = [
        { value: 'register', label: 'Registration', icon: UserPlus },
        { value: 'telegram', label: 'Telegram Auth', icon: Send },
    ];

    return (
        <AuthLayout showLoginBackground={true}>
            {/* Title */}
            <div className="mb-12">
                <h1 className="text-7xl tracking-[0.15em] uppercase text-gradient-gold-intense font-serif">
                    Registration
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

            {/* Auth Form Container */}
            <AuthContainer>
                {/* Mode Switch Buttons */}
                <AuthModeSwitch modes={modes} activeMode={authMode} onChange={(mode) => setAuthMode(mode as AuthMode)} />

                {/* Global Error Message */}
                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-900/30 border border-red-700/50 rounded text-amber-200 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Render component based on authMode */}
                {authMode === 'register' && <RegisterForm onSubmit={handleRegister} isLoading={isRegisterLoading} />}
                {authMode === 'telegram' && (
                    <TelegramAuth
                        onInitiate={handleTelegramInitiate}
                        onVerifyCode={handleTelegramVerify}
                        isLoading={isVerifyLoading}
                    />
                )}

                {/* Link to Login */}
                <div className="mt-8 text-center">
                    <p className="text-amber-600/70 text-sm tracking-wider">
                        Уже есть аккаунт?{' '}
                        <Link
                            to="/login"
                            className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors font-serif"
                        >
                            Войти
                        </Link>
                    </p>
                </div>
            </AuthContainer>
        </AuthLayout>
    );
}