import React, { useMemo } from 'react';
import { calculateVisaScore, type UserProfile } from '../utils/scoring';

interface AnalysisProps {
    onBack: () => void;
    onNavigate: (view: string) => void;
    userProfile: UserProfile | null;
    uploads: Record<string, any>;
}

const Analysis: React.FC<AnalysisProps> = ({ onBack, onNavigate, userProfile, uploads }) => {

    // Calculate real analysis score
    const analysis = useMemo(() => {
        if (!userProfile) {
            // Fallback if no profile (shouldn't happen in normal flow)
            return {
                percentage: 0,
                riskLevel: 'high' as const,
                riskLabel: 'Sin Datos',
                breakdown: { financial: 0, ties: 0, migration: 0, documentation: 0 },
                strengths: [],
                weaknesses: [],
                recommendations: ['Complete el perfil de usuario para ver el análisis.']
            };
        }
        return calculateVisaScore(userProfile, uploads);
    }, [userProfile, uploads]);

    // Risk level styling
    const getRiskColor = () => {
        switch (analysis.riskLevel) {
            case 'low': return 'status-green';
            case 'moderate': return 'status-yellow';
            case 'high': return 'status-red';
            default: return 'status-yellow';
        }
    };

    const riskColor = getRiskColor();

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display pb-32 flex flex-col">
            {/* Header Navigation */}
            <header className="px-6 py-4 flex items-center justify-between bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
                <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                    <span className="material-icons">chevron_left</span>
                </button>
                <h1 className="text-lg font-bold">Análisis de Perfil</h1>
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                    <span className="material-icons text-lg">share</span>
                </button>
            </header>

            <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Gauge & Summary */}
                <div className="flex flex-col items-center justify-start space-y-8">
                    {/* Probability Gauge Section */}
                    <section className="flex flex-col items-center bg-white dark:bg-slate-800/30 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 w-full">
                        <div className="gauge-container mb-6 scale-125">
                            <div className="gauge-bg"></div>
                            <div
                                className="gauge-fill"
                                style={{
                                    borderColor: `var(--color-${riskColor})`,
                                    transform: `rotate(${225 + (analysis.percentage / 100) * 270}deg)`
                                }}
                            ></div>
                            <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                                <span className="text-3xl font-extrabold">{analysis.percentage}%</span>
                            </div>
                        </div>
                        <div className="text-center mt-4">
                            <h2 className="text-2xl font-bold mb-2">Probabilidad de Aprobación</h2>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 bg-${riskColor}/10 border border-${riskColor}/30 rounded-full`}>
                                <div className={`w-2.5 h-2.5 rounded-full bg-${riskColor}`}></div>
                                <span className={`text-sm font-semibold text-${riskColor}`}>{analysis.riskLabel}</span>
                            </div>
                        </div>
                        <p className="text-center text-sm text-slate-500 mt-6 max-w-xs">
                            {analysis.percentage >= 75
                                ? 'Tu perfil es sólido y cumple con la mayoría de los requisitos consulares.'
                                : analysis.percentage >= 50
                                    ? 'Tu perfil es aceptable, pero necesita ajustes clave para asegurar el éxito.'
                                    : 'Tu perfil requiere mejoras significativas antes de aplicar.'}
                        </p>
                    </section>

                    {/* Metrics Grid */}
                    <section className="w-full">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 px-1">Métricas Detalladas</h3>
                        <div className="space-y-4">
                            {/* Metric Card: Estabilidad Financiera */}
                            <div className={`bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${analysis.breakdown.financial < 15 ? 'border-l-4 border-l-status-red' : ''}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Estabilidad Financiera</span>
                                    <span className={`text-sm font-bold ${analysis.breakdown.financial >= 20 ? 'text-primary' : analysis.breakdown.financial >= 15 ? 'text-status-yellow' : 'text-status-red'}`}>
                                        {Math.round((analysis.breakdown.financial / 30) * 100)}/100
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${analysis.breakdown.financial >= 20 ? 'bg-primary' : analysis.breakdown.financial >= 15 ? 'bg-status-yellow' : 'bg-status-red'}`}
                                        style={{ width: `${(analysis.breakdown.financial / 30) * 100}%` }}
                                    ></div>
                                </div>
                                {analysis.breakdown.financial < 15 && (
                                    <p className="text-[11px] mt-2 text-status-red/80 font-medium">Punto crítico: Requiere atención inmediata.</p>
                                )}
                            </div>

                            {/* Metric Card: Vínculos con Origen */}
                            <div className={`bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${analysis.breakdown.ties < 15 ? 'border-l-4 border-l-status-red' : ''}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Vínculos con Origen</span>
                                    <span className={`text-sm font-bold ${analysis.breakdown.ties >= 20 ? 'text-status-green' : analysis.breakdown.ties >= 15 ? 'text-status-yellow' : 'text-status-red'}`}>
                                        {Math.round((analysis.breakdown.ties / 25) * 100)}/100
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${analysis.breakdown.ties >= 20 ? 'bg-status-green' : analysis.breakdown.ties >= 15 ? 'bg-status-yellow' : 'bg-status-red'}`}
                                        style={{ width: `${(analysis.breakdown.ties / 25) * 100}%` }}
                                    ></div>
                                </div>
                                {analysis.breakdown.ties < 15 && (
                                    <p className="text-[11px] mt-2 text-status-red/80 font-medium">Punto crítico: Requiere atención inmediata.</p>
                                )}
                            </div>

                            {/* Metric Card: Historial Migratorio */}
                            <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Historial Migratorio</span>
                                    <span className={`text-sm font-bold ${analysis.breakdown.migration >= 20 ? 'text-status-green' : 'text-status-yellow'}`}>
                                        {Math.round((analysis.breakdown.migration / 25) * 100)}/100
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${analysis.breakdown.migration >= 20 ? 'bg-status-green' : 'bg-status-yellow'}`}
                                        style={{ width: `${(analysis.breakdown.migration / 25) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Detailed Analysis Lists */}
                <div className="space-y-8">
                    {/* Fortalezas */}
                    {analysis.strengths.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-status-green mb-4 flex items-center gap-2">
                                <span className="material-icons text-base">thumb_up</span>
                                Fortalezas del Perfil
                            </h3>
                            <div className="space-y-4">
                                {analysis.strengths.map((strength, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 bg-status-green/5 rounded-2xl border border-status-green/20 hover:bg-status-green/10 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-status-green/20 flex items-center justify-center flex-shrink-0">
                                            <span className="material-icons text-status-green text-xl">{strength.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-slate-900 dark:text-white">{strength.title}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{strength.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Debilidades */}
                    {analysis.weaknesses.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-status-red mb-4 flex items-center gap-2">
                                <span className="material-icons text-base">warning</span>
                                Debilidades Identificadas
                            </h3>
                            <div className="space-y-4">
                                {analysis.weaknesses.map((weakness, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 bg-status-red/5 rounded-2xl border border-status-red/20 hover:bg-status-red/10 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-status-red/20 flex items-center justify-center flex-shrink-0">
                                            <span className="material-icons text-status-red text-xl">{weakness.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-slate-900 dark:text-white">{weakness.title}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                {weakness.description}
                                                {weakness.suggestion && (
                                                    <span className="font-bold text-status-red"> Sugerencia: {weakness.suggestion}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            {/* Footer Actions */}
            <div className="sticky bottom-0 left-0 right-0 p-6 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <span className="material-icons">assignment_turned_in</span>
                        Generar Plan de Acción PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Analysis;
