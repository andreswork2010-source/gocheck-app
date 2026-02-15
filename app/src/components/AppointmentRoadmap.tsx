import React from 'react';

interface RoadmapStep {
    number: number;
    title: string;
    description: string;
    icon: string;
    tips?: string[];
    isPremium?: boolean;
}

interface AppointmentRoadmapProps {
    onBack: () => void;
    jurisdiction: 'UIO' | 'GYE' | 'ALL';
}

const AppointmentRoadmap: React.FC<AppointmentRoadmapProps> = ({ onBack, jurisdiction }) => {
    const steps: RoadmapStep[] = [
        {
            number: 1,
            title: "Registro Inicial",
            description: "Crea tu cuenta en el portal de BLS con un correo personal activo.",
            icon: "person_add",
            tips: ["Usa Gmail si es posible para evitar retrasos."]
        },
        {
            number: 2,
            title: "Verificación OTP",
            description: "Recibirás un código de un solo uso en tu correo. Ingrésalo para validar tu sesión.",
            icon: "enhanced_encryption",
            tips: ["Revisa la carpeta de Spam."]
        },
        {
            number: 3,
            title: "Jurisdicción",
            description: jurisdiction === 'UIO' ? "Selecciona el Centro de Visados de QUITO." : jurisdiction === 'GYE' ? "Selecciona el Centro de Visados de GUAYAQUIL." : "Selecciona el centro según tu lugar de residencia (UIO o GYE).",
            icon: "location_on",
            tips: ["No puedes cambiar el centro una vez iniciado el registro de datos."]
        },
        {
            number: 4,
            title: "Datos del Solicitante",
            description: "Ingresa nombre, pasaporte y fechas tal como aparecen en tu documento físico.",
            icon: "badge",
            tips: ["Un solo error en el número de pasaporte anula la cita."]
        },
        {
            number: 5,
            title: "Selección en Calendario",
            description: "Busca los días marcados en verde. Las fechas se habilitan periódicamente.",
            icon: "calendar_month",
            tips: ["Las citas se suelen abrir a medianoche o a primera hora de la mañana."]
        },
        {
            number: 6,
            title: "Pago y Servicios",
            description: "Elige entre cita Normal o Premium. El pago de gestión se hace en línea.",
            icon: "payments",
            isPremium: true,
            tips: ["El servicio Premium incluye sala VIP y ayuda con fotocopias."]
        },
        {
            number: 7,
            title: "Descarga de Carta",
            description: "Descarga e imprime el PDF de confirmación con el código de barras.",
            icon: "picture_as_pdf",
            tips: ["Lleva 2 copias impresas el día de la cita."]
        }
    ];

    return (
        <div className="bg-slate-950 min-h-screen font-display pb-20 overflow-x-hidden">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/50 hover:bg-slate-700 transition-colors">
                        <span className="material-icons text-white text-sm">chevron_left</span>
                    </button>
                    <div>
                        <h1 className="text-white font-bold text-lg">Roadmap de Cita BLS</h1>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Consulado de España en Ecuador</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-[10px] text-primary font-bold">ACTUALIZADO HOY</span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                <div className="mb-12 text-center">
                    <h2 className="text-2xl font-extrabold text-white mb-2">Tu Pasaporte al Éxito</h2>
                    <p className="text-slate-400 text-sm">Sigue esta ruta técnica para asegurar tu turno sin errores.</p>
                </div>

                {/* Timeline */}
                <div className="relative">
                    {/* Line Background */}
                    <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-slate-800 to-transparent"></div>

                    <div className="space-y-12">
                        {steps.map((step) => (
                            <div key={step.number} className="relative flex gap-6 group">
                                {/* Number Sphere */}
                                <div className="relative z-10 w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-900 border-2 border-primary shadow-[0_0_15px_rgba(37,106,244,0.3)] group-hover:scale-110 transition-transform">
                                    <span className="text-white font-bold">{step.number}</span>
                                </div>

                                {/* Content Card */}
                                <div className="flex-1 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-primary/30 transition-all">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`material-icons ${step.isPremium ? 'text-amber-400' : 'text-primary'}`}>{step.icon}</span>
                                            <h3 className="text-lg font-bold text-white">{step.title}</h3>
                                        </div>
                                        {step.isPremium && (
                                            <span className="text-[9px] bg-amber-400/10 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-400/20">PREMIUM</span>
                                        )}
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                        {step.description}
                                    </p>

                                    {/* Tips */}
                                    {step.tips && step.tips.map((tip, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                                            <span className="material-icons text-primary text-[14px]">lightbulb</span>
                                            <span className="text-[11px] text-slate-300 font-medium">{tip}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final Call to Action */}
                <div className="mt-16 bg-gradient-to-br from-primary/20 to-slate-900 border border-primary/30 rounded-3xl p-8 text-center shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-4">¿Todo listo para el siguiente paso?</h3>
                    <p className="text-slate-300 text-sm mb-8 max-w-lg mx-auto">
                        Te recomendamos tener tu pasaporte y reserva de vuelo a la mano antes de entrar al portal de BLS.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="https://ecuador.blsspainvisa.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02]"
                        >
                            <span className="material-icons">event</span>
                            IR AL PORTAL OFICIAL BLS
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AppointmentRoadmap;
