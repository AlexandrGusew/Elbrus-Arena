import { useRef, useEffect, useState, ReactNode } from 'react';
import { Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { getAssetUrl } from '../../../utils/assetUrl';
import loginBackground from '../images/login-background.png';

interface AuthLayoutProps {
    children: ReactNode;
    showBackButton?: boolean;
    onBack?: () => void;
    showExitButton?: boolean;
    onExit?: () => void;
    showLoginBackground?: boolean;
}

/**
 * Общая обертка для страниц авторизации
 * Содержит видео фон, музыку и декоративные элементы
 */
export function AuthLayout({ children, showBackButton = false, onBack, showExitButton = false, onExit, showLoginBackground = false }: AuthLayoutProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [musicOn, setMusicOn] = useState(() => {
        const savedMusicState = localStorage.getItem('musicPlaying');
        return savedMusicState !== null ? savedMusicState === 'true' : true;
    });

    // Управление музыкой
    useEffect(() => {
        if (audioRef.current) {
            if (musicOn) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch((e) => {
                        console.log('Autoplay blocked, waiting for user interaction');
                        setMusicOn(false);
                        localStorage.setItem('musicPlaying', 'false');
                    });
                }
            } else {
                audioRef.current.pause();
            }
        }
    }, [musicOn]);

    const onToggleMusic = () => {
        const newState = !musicOn;
        setMusicOn(newState);
        localStorage.setItem('musicPlaying', String(newState));
    };

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center relative overflow-hidden">
            {/* Видео фон */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 0 }}
            >
                <source src={getAssetUrl('createCharacter/animatedBackground.mp4')} type="video/mp4" />
            </video>

            {/* Фоновая музыка */}
            <audio ref={audioRef} loop>
                <source src={getAssetUrl('createCharacter/backgroundIntro.mp3')} type="audio/mpeg" />
            </audio>

            {/* Back Button */}
            {showBackButton && onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-6 left-6 px-5 py-2 border-2 border-amber-700/60 rounded bg-gradient-to-b from-stone-900/80 to-black/90 hover:from-stone-800/80 hover:to-stone-900/90 transition-all flex items-center gap-2 text-amber-300 shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] backdrop-blur-sm"
                    style={{ zIndex: 10 }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="tracking-[0.2em] text-sm uppercase">Back</span>
                </button>
            )}

            {/* Exit Button */}
            {showExitButton && onExit && (
                <button
                    onClick={onExit}
                    className="absolute top-6 left-6 px-5 py-2 border-2 border-amber-700/60 rounded bg-gradient-to-b from-stone-900/80 to-black/90 hover:from-stone-800/80 hover:to-stone-900/90 transition-all flex items-center gap-2 text-amber-300 shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] backdrop-blur-sm"
                    style={{ zIndex: 10 }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="tracking-[0.2em] text-sm uppercase">Exit</span>
                </button>
            )}

            {/* Music Toggle */}
            <button
                onClick={onToggleMusic}
                className="absolute top-6 right-6 px-5 py-2 border-2 border-amber-700/60 rounded bg-gradient-to-b from-stone-900/80 to-black/90 hover:from-stone-800/80 hover:to-stone-900/90 transition-all flex items-center gap-2 text-amber-300 shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] backdrop-blur-sm"
                style={{ zIndex: 10 }}
            >
                {musicOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="tracking-[0.2em] text-sm uppercase">Music {musicOn ? 'On' : 'Off'}</span>
            </button>

            {/* Decorative top element */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-amber-600/50 to-transparent" style={{ zIndex: 5 }}></div>

            {/* Content */}
            <div
                className="relative z-[5] w-screen h-screen flex flex-col items-center justify-center"
                style={showLoginBackground ? {
                    backgroundImage: `url(${loginBackground})`,
                    backgroundSize: '66%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                } : {}}
            >
                {children}
            </div>

            {/* Decorative bottom element */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-amber-600/50 to-transparent" style={{ zIndex: 5 }}></div>
        </div>
    );
}