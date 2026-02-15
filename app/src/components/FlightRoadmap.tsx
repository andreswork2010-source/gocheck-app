import React from 'react';

interface RoadmapStep {
    number: number;
    title: string;
    description: string;
    icon: string;
    tips?: string[];
}

interface FlightRoadmapProps {
    onBack: () => void;
}

const FlightRoadmap: React.FC<FlightRoadmapProps> = ({ onBack }) => {
    const steps: RoadmapStep[] = [
        {
            number: 1,
            title: "Búsqueda Estratégica",
            description: "Busca vuelos directos en aerolíneas de bandera como Iberia o Air Europa. Estas permiten bloqueos de tarifa más estables que las aerolíneas low-cost.",
            icon: "flight_takeoff",
            tips: ["Prioriza aerolíneas que vuelen directo desde Ecuador (UIO/GYE) para una mejor imagen ante el oficial."]
        },
        {
            number: 2,
            title: "Selección de Itinerario",
            description: "Define tus fechas de entrada y salida de la zona Schengen. Es vital que estas fechas coincidan con tu seguro y formulario.",
            icon: "calendar_month",
            tips: ["Deja un margen de al menos 3 días laborables entre la cita y el viaje planeado."]
        },
        {
            number: 3,
            title: "Bloqueo de Tarifa",
            description: "No compres el boleto total aún. Usa servicios especializados ($15-$30) o la opción de 'Pago en Oficina' de aerolíneas para generar un PNR temporal.",
            icon: "lock",
            tips: ["El código PNR (Passenger Name Record) es lo que el oficial verificará en su sistema."]
        },
        {
            number: 4,
            title: "Generación de PDF",
            description: "Descarga el itinerario que muestre tu nombre (exactamente como en el pasaporte), número de vuelo, código de reserva y logo de la aerolínea.",
            icon: "picture_as_pdf",
            tips: ["Verifica que el estado de la reserva aparezca como 'Confirmed' o 'On Hold'."]
        },
        {
            number: 5,
            title: "Timing Estratégico",
            description: "Este es el paso crítico. Genera tu reserva máximo 24 horas antes de tu cita consular para asegurar que siga vigente al momento del análisis.",
            icon: "timer",
            tips: ["Si la reserva caduca el día de la cita, el consulado puede considerar que no tienes pasaje confirmado."]
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
                        <h1 className="text-white font-bold text-lg">Hoja de Ruta: Vuelos</h1>
                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Estrategia de Itinerario Seguro</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-orange-400/10 px-3 py-1 rounded-full border border-orange-400/20">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                    <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Crítico: Vigencia PNR</span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Tu Reserva de Vuelo</h2>
                    <p className="text-slate-400 text-sm max-w-md mx-auto">Sigue estos pasos para obtener un itinerario válido y verificable sin arriesgar la compra total del boleto.</p>
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
                                            <span className="material-icons text-cyan-400 text-[16px] mt-0.5">warning</span>
                                            <span className="text-[11px] text-cyan-100/80 font-medium leading-tight">{tip}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final Call to Action */}
                <div className="mt-16 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <h3 className="text-xl font-bold text-white mb-4">¿Entendido el proceso?</h3>
                    <p className="text-slate-400 text-sm mb-8 max-w-lg mx-auto">
                        Regresa al asistente si necesitas los enlaces directos a las aerolíneas o servicios especializados para empezar tu reserva.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={onBack}
                            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-cyan-400/20 flex items-center justify-center gap-2 hover:scale-[1.02]"
                        >
                            <span className="material-icons">chat</span>
                            VOLVER AL ASISTENTE
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FlightRoadmap;
