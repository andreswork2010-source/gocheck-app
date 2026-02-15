import React from 'react';

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Gradient Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>

            {/* Main Content Card */}
            <div className="relative z-10 w-full max-w-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/5">

                {/* Logo Section */}
                <div className="flex flex-col items-center space-y-8 mb-12">
                    <div className="relative group">
                        {/* Dynamic Glow effect */}
                        <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full group-hover:bg-primary/40 transition-colors duration-500"></div>
                        <div className="relative bg-white dark:bg-slate-800 p-6 rounded-full border border-slate-100 dark:border-slate-700 shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <img
                                alt="GoluM Logo"
                                className="w-16 h-16 object-contain"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5p1fmbWara3Nyi0CLlPJ29-DyZVS7re5dEgOXRAj5ueFywoZnag3amr9mzztlLqEqvaWYpU9ecQSagOxP6v5cjsDLyGSAneM1oENctoZdIftqAanB5XIalfuMyp0g8qFohfPhK5Vv3JpLY7iA7FIEiGuzsrR2w4s4tN_ODNJ_Rkfhl0qDiCwU3ZvfcqDlgqSXiambaF1ShNEUz-s-nFLaYItBmKR-O23BNReFD7Im_RwmO_lzsjP2PepyDNu4QC7Xe84IeIdKbcY"
                            />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Inicia sesión en GoluM
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Tu puente seguro hacia Europa
                        </p>
                    </div>
                </div>

                {/* Authentication Button */}
                <div className="space-y-6">
                    <button
                        onClick={onLogin}
                        className="w-full relative flex items-center justify-center space-x-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-black/5 transition-all active:scale-[0.98] border border-slate-200 dark:border-slate-600 group overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                        </svg>
                        <span className="text-base relative z-10">Continuar con Google</span>
                    </button>

                    {/* Security Badge */}
                    <div className="flex justify-center items-center space-x-2 text-slate-400 dark:text-slate-500">
                        <span className="material-icons text-xs">lock</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Conexión Encriptada SSL</span>
                    </div>
                </div>
            </div>

            {/* Footer / Legal Section */}
            <div className="absolute bottom-6 w-full text-center px-6">
                <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-600">
                    Al continuar, aceptas nuestros
                    <a className="text-primary hover:text-primary/80 font-semibold ml-1 transition-colors" href="#">Términos de Servicio</a>
                    y
                    <a className="text-primary hover:text-primary/80 font-semibold ml-1 transition-colors" href="#">Política de Privacidad</a>.
                </p>
            </div>
        </div>
    );
};

export default Login;
