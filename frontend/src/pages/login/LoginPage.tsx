import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Send } from 'lucide-react';
import { AuthLayout } from './components/AuthLayout';
import { AuthContainer } from './components/AuthContainer';
import { AuthModeSwitch } from './components/AuthModeSwitch';
import { LoginForm } from './components/LoginForm';
import { TelegramAuth } from './components/TelegramAuth';
import {
    useLoginMutation,
    useInitiateTelegramAuthMutation,
    useVerifyTelegramCodeMutation,
} from '../../store/api/authApi';

/**
 * LOGIN PAGE - Страница входа
 * Размер экрана: 1440x1080
 */

type AuthMode = 'login' | 'telegram';

export function LoginPage() {
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [error, setError] = useState('');

    // API mutations
    const [login, { isLoading: isLoginLoading }] = useLoginMutation();
    const [initiateTelegramAuth] = useInitiateTelegramAuthMutation();
    const [verifyTelegramCode, { isLoading: isVerifyLoading }] = useVerifyTelegramCodeMutation();

    // После успешной авторизации → редирект на выбор героя
    const handleAuthSuccess = async () => {
        navigate('/choose-hero');
    };

    // Обработчики форм
    const handleLogin = async (username: string, password: string) => {
        try {
            setError('');
            await login({ username, password }).unwrap();
            await handleAuthSuccess();
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.data?.message || 'Ошибка входа');
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
        { value: 'login', label: 'Login', icon: LogIn },
        { value: 'telegram', label: 'Telegram Auth', icon: Send },
    ];

    return (
        <AuthLayout>
            {/* Title */}
            <div className="mb-12">
                <h1 className="text-7xl tracking-[0.15em] uppercase text-gradient-gold-intense font-serif">
                    Login
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

                <div className="text-center mb-6 relative">
                    <div className="inline-block px-6 py-1 border-y border-amber-800/40">
                        <h2 className="text-amber-400/90 tracking-[0.2em] uppercase text-xs font-serif">
                            Enter the Game
                        </h2>
                    </div>
                </div>

                {/* Render component based on authMode */}
                {authMode === 'login' && <LoginForm onSubmit={handleLogin} isLoading={isLoginLoading} />}
                {authMode === 'telegram' && (
                    <TelegramAuth
                        onInitiate={handleTelegramInitiate}
                        onVerifyCode={handleTelegramVerify}
                        isLoading={isVerifyLoading}
                    />
                )}

                {/* Link to Register */}
                <div className="mt-8 text-center">
                    <p className="text-amber-600/70 text-sm tracking-wider">
                        Нет аккаунта?{' '}
                        <Link
                            to="/register"
                            className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors font-serif"
                        >
                            Зарегистрироваться
                        </Link>
                    </p>
                </div>
            </AuthContainer>
        </AuthLayout>
    );
}