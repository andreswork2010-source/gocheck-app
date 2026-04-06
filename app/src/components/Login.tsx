import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginProps {
    // onLogin is now handled by the auth state listener in App.tsx
}

const Login: React.FC<LoginProps> = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);

    const handleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        setMessage(null);
        try {
            const { error: signInError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            if (signInError) throw signInError;
        } catch (err: any) {
            console.error("Login Error:", err);
            setError(err.message || "Error al iniciar sesión");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);
        try {
            const { error: signInError } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin,
                }
            });
            if (signInError) throw signInError;
            setMessage("¡Revisa tu bandeja de entrada! Te enviamos un enlace de acceso.");
        } catch (err: any) {
            setError(err.message || "Error al enviar el enlace");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Gradient Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>

            {/* Main Content Card */}
            <div className="relative z-10 w-full max-w-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/5">

                {/* Logo Section */}
                <div className="flex flex-col items-center space-y-4 mb-8">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full"></div>
                        <div className="relative bg-white dark:bg-slate-800 p-4 rounded-full border border-slate-100 dark:border-slate-700 shadow-lg">
                            <img
                                alt="Go-Check Logo"
                                className="w-16 h-16 object-contain"
                                src="/logo3.png"
                            />
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Bienvenido a Go-Check</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Tu experto en trámites de visa</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-100 dark:border-red-800/50">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm text-center border border-green-100 dark:border-green-800/50">
                            {message}
                        </div>
                    )}

                    <button
                        onClick={handleSignIn}
                        disabled={isLoading}
                        className="w-full relative flex items-center justify-center space-x-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-semibold py-4 px-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-600 transition-all disabled:opacity-70"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                        </svg>
                        <span>{isLoading ? 'Cargando...' : 'Continuar con Google'}</span>
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-slate-800 px-2 text-slate-500">O con tu email</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <input
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-70"
                        >
                            {isLoading ? "Enviando..." : "Acceder con Email"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="absolute bottom-6 w-full text-center px-6">
                <p className="text-[11px] text-slate-400">
                    Al continuar, aceptas nuestros
                    <a className="text-primary font-semibold ml-1" href="#">Términos</a> y
                    <a className="text-primary font-semibold ml-1" href="#">Privacidad</a>.
                </p>
            </div>
        </div>
    );
};

export default Login;
