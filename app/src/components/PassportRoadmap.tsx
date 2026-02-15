import React from 'react';

interface RoadmapStep {
    number: number;
    title: string;
    description: string;
    icon: string;
    tips?: string[];
}

interface PassportRoadmapProps {
    onBack: () => void;
}

const PassportRoadmap: React.FC<PassportRoadmapProps> = ({ onBack }) => {
    const steps: RoadmapStep[] = [
        {
            number: 1,
            title: "Pago de la Especie",
            description: "Cancela los $90 oficiales. Puedes hacerlo en Banco del Pacífico, Western Union o PagoÁgil solo con tu número de cédula.",
            icon: "payments",
            tips: ["También puedes pagar con tarjeta de crédito en la Agencia Virtual."]
        },
        {
            number: 2,
            title: "Validación (24 Horas)",
            description: "El sistema del Registro Civil tarda hasta 24 horas en habilitar tu pago para que puedas agendar el turno.",
            icon: "timer",
            tips: ["Si pagas con tarjeta online, la habilitación suele ser inmediata."]
        },
        {
            number: 3,
            title: "Agendamiento de Turno",
            description: "Ingresa a la Agencia Virtual, selecciona 'Pasaporte Ordinario' y elige la agencia y horario disponible.",
            icon: "event_available",
            tips: ["Revisa varias veces al día; los turnos se liberan periódicamente."]
        },
        {
            number: 4,
            title: "Cita Presencial",
            description: "Acude a la agencia puntualmente. Te tomarán la foto, huellas y firma en el sitio.",
            icon: "person_pin",
            tips: ["Solo necesitas llevar tu CÉDULA original física."]
        },
        {
            number: 5,
            title: "Entrega del Documento",
            description: "El pasaporte se entrega generalmente el mismo día o en un plazo de 48 horas en agencias principales.",
            icon: "auto_stories",
            tips: ["Verifica que todos tus nombres estén correctos antes de salir de la agencia."]
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
                        <h1 className="text-white font-bold text-lg">Guía de Pasaporte</h1>
                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Paso 0: La Llave de tu Viaje</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Procedimiento Oficial</span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Obtén tu Pasaporte</h2>
                    <p className="text-slate-400 text-sm max-w-md mx-auto">Sigue esta ruta técnica obligatoria para obtener tu documento de identidad internacional en Ecuador.</p>
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
                                        <div key={i} className="flex items-start gap-2 bg-cyan-900/20 p-3 rounded-xl border border-cyan-400/10">
                                            <span className="material-icons text-cyan-400 text-[16px] mt-0.5">info</span>
                                            <span className="text-[11px] text-cyan-100/80 font-medium leading-tight">{tip}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final Call to Action */}
                <div className="mt-16 bg-gradient-to-br from-cyan-900/40 to-slate-900 border border-cyan-400/30 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <h3 className="text-xl font-bold text-white mb-4">¿Todo preparado para pagar e iniciar?</h3>
                    <p className="text-slate-400 text-sm mb-8 max-w-lg mx-auto">
                        Recuerda que el pago es personal y solo necesitas tu número de cédula para realizarlo en el banco o agencia virtual.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="https://virtual.registrocivil.gob.ec/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-cyan-400/20 flex items-center justify-center gap-2 hover:scale-[1.02]"
                        >
                            <span className="material-icons">open_in_new</span>
                            IR AL REGISTRO CIVIL VIRTUAL
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PassportRoadmap;
