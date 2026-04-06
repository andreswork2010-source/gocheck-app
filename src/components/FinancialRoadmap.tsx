import React from 'react';

interface RoadmapStep {
    number: number;
    title: string;
    description: string;
    icon: string;
    tips?: string[];
}

interface FinancialRoadmapProps {
    onBack: () => void;
}

const FinancialRoadmap: React.FC<FinancialRoadmapProps> = ({ onBack }) => {
    const steps: RoadmapStep[] = [
        {
            number: 1,
            title: "Estados de Cuenta Bancarios",
            description: "Solicita en tu banco los últimos 3 a 6 meses de movimientos. Deben estar sellados y firmados por la institución financiera.",
            icon: "account_balance",
            tips: ["Mínimo recomendado: €60-€100 por día de viaje.", "El saldo debe ser consistente, no deposites todo de golpe."]
        },
        {
            number: 2,
            title: "Carta Laboral",
            description: "Pide a tu empleador una carta en papel membretado que indique tu cargo, salario mensual, fecha de ingreso y que estás autorizado para viajar.",
            icon: "work",
            tips: ["Debe estar firmada y sellada por Recursos Humanos o Gerencia.", "Si eres independiente, presenta tu RUC y declaraciones de impuestos."]
        },
        {
            number: 3,
            title: "Certificados de Propiedad",
            description: "Si tienes bienes inmuebles o vehículos a tu nombre, presenta las escrituras o matrículas como prueba de arraigo.",
            icon: "home_work",
            tips: ["Esto demuestra que tienes razones para regresar a Ecuador."]
        },
        {
            number: 4,
            title: "Declaración de Impuestos",
            description: "Si eres profesional independiente o empresario, incluye tu última declaración del SRI como respaldo de ingresos.",
            icon: "receipt_long",
            tips: ["Especialmente importante si no tienes carta laboral de empleador."]
        },
        {
            number: 5,
            title: "Carta de Patrocinio (Opcional)",
            description: "Si un familiar o amigo en España cubrirá tus gastos, debe presentar una carta notariada con sus estados de cuenta y prueba de ingresos.",
            icon: "handshake",
            tips: ["El patrocinador debe demostrar solvencia suficiente para cubrir tu viaje."]
        }
    ];

    return (
        <div className="bg-slate-950 min-h-screen font-display pb-20 overflow-x-hidden">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-cyan-900/30 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/50 hover:bg-slate-700 transition-colors">
                        <span className="material-icons text-white text-sm">chevron_left</span>
                    </button>
                    <div>
                        <h1 className="text-white font-bold text-lg">Hoja de Ruta: Solvencia</h1>
                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Prueba de Recursos Económicos</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                    <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">Requisito Crítico</span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Tu Solvencia Económica</h2>
                    <p className="text-slate-400 text-sm max-w-md mx-auto">Demuestra que tienes los recursos suficientes para cubrir tu estadía sin trabajar ilegalmente en Europa.</p>
                </div>

                {/* Timeline */}
                <div className="relative">
                    {/* Line Background */}
                    <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-slate-800 to-transparent"></div>

                    <div className="space-y-12">
                        {steps.map((step) => (
                            <div key={step.number} className="relative flex gap-6 group">
                                {/* Number Sphere */}
                                <div className="relative z-10 w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-900 border-2 border-cyan-400 shadow-[0_0_15px_rgba(13,242,242,0.3)] group-hover:scale-110 transition-transform">
                                    <span className="text-white font-bold">{step.number}</span>
                                </div>

                                {/* Content Card */}
                                <div className="flex-1 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-cyan-400/30 transition-all">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="material-icons text-cyan-400">{step.icon}</span>
                                        <h3 className="text-lg font-bold text-white">{step.title}</h3>
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                        {step.description}
                                    </p>

                                    {/* Tips */}
                                    {step.tips && step.tips.map((tip, i) => (
                                        <div key={i} className="flex items-start gap-2 bg-cyan-900/20 p-3 rounded-xl border border-cyan-400/10 mb-2">
                                            <span className="material-icons text-cyan-400 text-[16px] mt-0.5">tips_and_updates</span>
                                            <span className="text-[11px] text-cyan-100/80 font-medium leading-tight">{tip}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Important Note */}
                <div className="mt-16 bg-gradient-to-br from-yellow-900/20 to-slate-900 border border-yellow-400/30 rounded-3xl p-8">
                    <div className="flex items-start gap-4">
                        <span className="material-icons text-yellow-400 text-3xl">warning</span>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">⚠️ Regla de Oro</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                El consulado busca <strong>coherencia</strong>. Si declaras un salario de $800/mes pero presentas estados de cuenta con $10,000,
                                levantarás sospechas. Asegúrate de que todos tus documentos cuenten la misma historia financiera.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Back Link */}
                <div className="mt-8 text-center">
                    <button onClick={onBack} className="text-cyan-400 font-bold hover:underline flex items-center gap-2 mx-auto">
                        <span className="material-icons text-sm">arrow_back</span>
                        VOLVER AL ASISTENTE
                    </button>
                </div>
            </main>
        </div>
    );
};

export default FinancialRoadmap;
