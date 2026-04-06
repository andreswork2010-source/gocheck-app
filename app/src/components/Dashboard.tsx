import React, { useMemo } from 'react';
import { VISA_DATA } from '../data/visaData';
import { calculateVisaScore, type UserProfile } from '../utils/scoring';
import { supabase } from '../lib/supabase';
import NotificationBell from './NotificationBell';
import ConsularNews from './ConsularNews';

interface DashboardProps {
    onBoost: () => void;
    onNavigate: (view: string) => void;
    // New Props
    destinationId: string;
    visaTypeId: string;
    days: number;
    userName: string;
    userProfile: UserProfile | null;
    uploads: Record<string, any>;
}

const Dashboard: React.FC<DashboardProps> = ({ onBoost, onNavigate, destinationId, visaTypeId, days, userName, userProfile, uploads }) => {

    // Calculate real score
    const analysis = useMemo(() => {
        if (!userProfile) {
            return { percentage: 0, riskLevel: 'high' as const, riskLabel: 'Sin Datos' };
        }
        return calculateVisaScore(userProfile, uploads);
    }, [userProfile, uploads]);

    // Fallback if data is missing
    const country = VISA_DATA.find(c => c.id === destinationId) || VISA_DATA[0];
    const visa = country?.visas.find(v => v.id === visaTypeId) || country?.visas[0];
    const displayName = userName || "Usuario";

    return (
        <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen pb-24 flex flex-col">
            {/* Top Navigation Bar (Responsive) */}
            <nav className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="relative cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onNavigate('onboarding')} title="Editar Perfil">
                        <img
                            alt="Profile Picture"
                            className="w-10 h-10 rounded-full border-2 border-primary object-cover"
                            src={userProfile?.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"}
                        />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-status-green border-2 border-background-dark rounded-full"></div>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Bienvenido de vuelta,</p>
                        <h2 className="text-sm font-bold">{displayName}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                        title="Cerrar sesión"
                    >
                        <span className="material-icons text-lg">logout</span>
                    </button>
                    <NotificationBell 
                        dates={userProfile?.importantDates || []} 
                        onOpenCalendar={() => onNavigate('calendar')} 
                    />

                    {/* Desktop Menu - Hidden on Mobile */}
                    <div className="hidden md:flex items-center gap-2 text-sm font-medium">
                        <button className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">Inicio</button>
                        <button onClick={() => onNavigate('documents')} className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">Documentos</button>
                        <button onClick={() => onNavigate('calendar')} className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">Agenda</button>


                        {/* BOTÓN RESALTADO */}
                        <button
                            onClick={() => onNavigate('assistant')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                        >
                            <span className="material-icons text-sm animate-bounce">smart_toy</span>
                            Asesoría AI
                        </button>

                        <button onClick={() => onNavigate('onboarding')} className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">Perfil</button>
                    </div>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Left Column: Probability + Stats (Mobile: Full Width, Desktop: 4 cols) */}
                <div className="md:col-span-4 lg:col-span-3 space-y-6">
                    {/* Probability Card */}
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 border border-primary/20 shadow-xl shadow-primary/5 hover:border-primary/40 transition-colors group cursor-pointer" onClick={() => onNavigate('analysis')}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-full flex justify-between items-start mb-2">
                                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Probabilidad</h3>
                                <span className="material-icons text-primary/50 group-hover:text-primary transition-colors text-lg">insights</span>
                            </div>

                            <div className="relative w-40 h-40 flex items-center justify-center my-4">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle className="text-slate-200 dark:text-slate-800" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
                                    <circle
                                        className={`${analysis.riskLevel === 'low' ? 'text-status-green' : analysis.riskLevel === 'moderate' ? 'text-status-yellow' : 'text-status-red'}`}
                                        cx="80" cy="80" fill="transparent" r="70" stroke="currentColor"
                                        strokeDasharray="440"
                                        strokeDashoffset={440 - (440 * analysis.percentage / 100)}
                                        strokeLinecap="round" strokeWidth="12"
                                    ></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{analysis.percentage}%</span>
                                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                                        {analysis.riskLevel === 'low' ? 'Excelente' : analysis.riskLevel === 'moderate' ? 'Preparado' : 'Mejorar'}
                                    </span>
                                </div>
                            </div>

                            <div className="w-full mt-2 bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Estado</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${analysis.riskLevel === 'low' ? 'text-status-green bg-status-green/10' :
                                        analysis.riskLevel === 'moderate' ? 'text-status-yellow bg-status-yellow/10' :
                                            'text-status-red bg-status-red/10'
                                        }`}>
                                        {analysis.riskLabel.toUpperCase()}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-1 h-1.5">
                                    <div className={`rounded-full ${analysis.percentage >= 75 ? 'bg-status-green' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                    <div className={`rounded-full ${analysis.percentage >= 50 && analysis.percentage < 75 ? 'bg-status-yellow' : analysis.percentage >= 75 ? 'bg-status-green' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                    <div className={`rounded-full ${analysis.percentage < 50 ? 'bg-status-red' : analysis.percentage >= 75 ? 'bg-status-green' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Travel Details Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex flex-col gap-4 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                        <div className="flex items-start gap-3 relative z-10">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-2xl">
                                {country?.flag || '✈️'}
                            </div>
                            <div className="flex-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destino Configurado</span>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">{country?.name || 'No definido'}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">{visa?.name || 'Sin visado'}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-bold">{days} Días</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => onNavigate('onboarding')}
                            className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors relative z-10"
                        >
                            <span className="material-icons text-sm">edit</span> Editar Viaje
                        </button>
                    </div>

                    <button
                        onClick={onBoost}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span className="material-icons">bolt</span>
                        <span>Mejorar mi Probabilidad</span>
                    </button>

                    {/* Consular News Feed */}
                    <ConsularNews />
                </div>

                {/* Center/Right Column: Content & Actions (Mobile: Full Width, Desktop: 8 cols) */}
                <div className="md:col-span-8 lg:col-span-9 space-y-6 flex flex-col">

                    {/* Advisory Banner (Desktop Version) */}
                    <div className="relative rounded-2xl overflow-hidden min-h-[220px] group cursor-pointer shadow-lg shadow-primary/5 border border-slate-200 dark:border-slate-800" onClick={() => onNavigate('assistant')}>
                        <img
                            alt="Advisor Background"
                            className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTpNJNo1I8jk7yztG6510M5auBxFp-6C0DrxsM5g0f4UXRSsetsdKEhaxVZMJU-rNvWJvhRLdGJFXzA07nWbccJxu5T2N8bBE0xS2UVa8N_l2lWvW26IBEFdISLB05_FeZasAFHQJyQCIcreaZbXCuNsV-saByLb06Ete1-RO5l-2k-05Qc41PxqFuPNmfkoGFsuTKBLPxb3J6EyiHLU93BroBhLNPOfMzHsscC0GaedqHGyXQEFXjas0Vo2GQX7D4Jj5YgQFW3HI"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/40 dark:from-primary/90 dark:to-primary/20"></div>
                        <div className="absolute inset-0 flex flex-col justify-center px-8 md:items-start items-center text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3 border border-white/10">
                                <span className="material-icons text-white text-xs">smart_toy</span>
                                <span className="text-white text-[10px] font-bold uppercase tracking-widest">Asistente AI Activo</span>
                            </div>
                            <h4 className="text-white font-bold text-2xl md:text-3xl leading-tight mb-2">Resuelve tus dudas<br />con Go-Check</h4>
                            <p className="text-white/80 text-sm md:max-w-md">Obtén respuestas instántaneas sobre requisitos, tiempos y procesos legales para tu visa a {country?.name}.</p>
                        </div>
                        <div className="absolute right-0 bottom-0 p-4 opacity-50 hidden md:block">
                            <span className="material-icons text-white text-[100px]">chat</span>
                        </div>
                    </div>

                    {/* AI Insights Card */}
                    {userProfile && (
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden mb-6">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-icons text-primary text-xl">psychology</span>
                                    <h3 className="text-white font-bold text-base">Análisis Inteligente Go-Check</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        Detectamos que eres <span className="text-white font-bold">{userProfile.profession}</span>. 
                                        {parseFloat(userProfile.income) < 1500 
                                            ? " Para tu destino, te recomendamos reforzar tu solvencia con extractos de ahorros de al menos 6 meses."
                                            : " Tu nivel de ingresos es sólido para los estándares Schengen."}
                                    </p>
                                    <button 
                                        onClick={() => onNavigate('assistant')}
                                        className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
                                    >
                                        Seguir analizando con IA <span className="material-icons text-xs">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                            <div className="absolute -right-6 -bottom-6 opacity-10">
                                <span className="material-icons text-[120px] text-white">smart_toy</span>
                            </div>
                        </div>
                    )}

                    {/* Agenda Snippet */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <span className="material-icons text-primary">calendar_today</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Agenda Próxima</h3>
                            </div>
                            <button onClick={() => onNavigate('calendar')} className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">Ver Todo</button>
                        </div>
                        <div className="space-y-4">
                            {userProfile?.importantDates && userProfile.importantDates.length > 0 ? (
                                [...userProfile.importantDates]
                                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                    .filter(d => new Date(d.date) >= new Date(new Date().setHours(0,0,0,0)))
                                    .slice(0, 2)
                                    .map(date => (
                                        <div key={date.id} className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                                            <div className="bg-primary/10 text-primary w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="material-icons text-sm">{date.type === 'flight' ? 'flight_takeoff' : 'event'}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{date.title}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-slate-500">{new Date(date.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                                                    {date.memberName && <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase">{date.memberName}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-xs text-slate-500 italic">No hay eventos próximos.</p>
                                    <button onClick={() => onNavigate('calendar')} className="text-[10px] font-bold text-primary mt-2">Agregar Cita</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TRAVELPAYOUTS DRIVER INTEGRATION: Booking Center */}
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 border border-emerald-500 shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                    <span className="material-icons text-white">verified_user</span>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg leading-none">Centro de Reservas Obligatorias</h3>
                                    <p className="text-emerald-100/70 text-[10px] uppercase font-bold tracking-widest mt-1">Power by Go-Check Driver</p>
                                </div>
                            </div>
                            
                            <p className="text-white/90 text-sm mb-6 leading-relaxed">
                                Para tu visa a {country?.name || 'su destino'}, el consulado exige documentos de reserva verificados. Obtén los tuyos con nuestros aliados oficiales para asegurar el cumplimiento legal.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <a 
                                    href={`https://tp.media/r?marker=703875&p=2422&u=https://www.aviasales.com`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 p-3 rounded-xl transition-all flex flex-col items-center text-center gap-2"
                                >
                                    <span className="material-icons text-white">flight_takeoff</span>
                                    <span className="text-[11px] font-bold text-white">Reserva de Vuelo</span>
                                </a>
                                <a 
                                    href={`https://tp.media/r?marker=703875&p=3453&u=https://ectatravel.com`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 p-3 rounded-xl transition-all flex flex-col items-center text-center gap-2"
                                >
                                    <span className="material-icons text-white">health_and_safety</span>
                                    <span className="text-[11px] font-bold text-white">Seguro de Viaje</span>
                                </a>
                                <a 
                                    href={`https://tp.media/r?marker=703875&p=1214&u=https://www.booking.com`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 p-3 rounded-xl transition-all flex flex-col items-center text-center gap-2"
                                >
                                    <span className="material-icons text-white">hotel</span>
                                    <span className="text-[11px] font-bold text-white">Hospedaje Real</span>
                                </a>
                            </div>
                        </div>
                        {/* Decorative Background Element */}
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                    </div>

                    {/* Next Steps List */}
                    <div className="flex-1 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Lista de Tareas</h3>
                                <p className="text-sm text-slate-500">Documentación principal para {country?.name}</p>
                            </div>
                            <button className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors" onClick={() => onNavigate('documents')}>
                                Ver Todo
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* Items - Dynamic based on visa type ideally, but keeping static placeholder for now as requested */}
                            {[
                                { title: "Certificado Laboral", desc: "Emitido por RRHH (Máx 3 meses)", status: "pending", icon: "priority_high", color: "text-status-yellow border-status-yellow" },
                                { title: "Seguro de Viaje", desc: "Cobertura mínima de €30.000", status: "pending", icon: "contact_page", color: "text-slate-400 border-slate-200 dark:border-slate-700" },
                                { title: "Copia de Pasaporte", desc: "Todas las páginas con sellos", status: "done", icon: "check", color: "bg-status-green border-transparent text-white" }
                            ].map((step, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => onNavigate('documents')}
                                    className={`group flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer ${step.status === 'done' ? 'opacity-50' : 'bg-white dark:bg-slate-800'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${step.color}`}>
                                            <span className={`material-icons text-sm ${step.status === 'done' ? 'text-white' : ''}`}>{step.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-bold ${step.status === 'done' ? 'line-through text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>{step.title}</h4>
                                            <p className="text-xs text-slate-500">{step.desc}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {step.status === 'pending' && <span className="text-[10px] font-bold uppercase text-primary opacity-0 group-hover:opacity-100 transition-opacity">Resolver</span>}
                                        <span className={`material-icons ${step.status === 'done' ? 'text-status-green' : 'text-slate-300'}`}>
                                            {step.status === 'done' ? 'verified' : 'chevron_right'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Navigation (Hidden on Desktop) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-background-dark/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 pt-3 pb-8 flex justify-between items-center z-50">
                <div className="flex flex-col items-center gap-1 text-primary cursor-pointer" onClick={() => onNavigate('dashboard')}>
                    <span className="material-icons">dashboard</span>
                    <span className="text-[10px] font-bold">Inicio</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200" onClick={() => onNavigate('documents')}>
                    <span className="material-icons">description</span>
                    <span className="text-[10px] font-medium">Docs</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200" onClick={() => onNavigate('assistant')}>
                    <span className="material-icons">chat_bubble_outline</span>
                    <span className="text-[10px] font-medium">Asesoría</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200" onClick={() => onNavigate('calendar')}>
                    <span className="material-icons">calendar_month</span>
                    <span className="text-[10px] font-medium">Agenda</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200" onClick={() => onNavigate('onboarding')}>

                    <span className="material-icons">person_outline</span>
                    <span className="text-[10px] font-medium">Perfil</span>
                </div>
            </nav>
            {/* BOTÓN FLOTANTE AI */}
            <button
                onClick={() => onNavigate('assistant')}
                className="fixed bottom-24 md:bottom-10 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 active:scale-90 transition-all group"
            >
                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20 group-hover:opacity-0"></div>
                <span className="material-icons text-3xl">smart_toy</span>

                {/* Etiqueta flotante */}
                <div className="absolute right-full mr-4 bg-slate-900 text-white text-xs font-bold py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    ¿Dudas? Pregúntame
                </div>
            </button>
        </div>
    );
};

export default Dashboard;
