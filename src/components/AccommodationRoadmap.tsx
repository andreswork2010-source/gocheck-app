import React from 'react';

interface RoadmapStep {
    number: number;
    title: string;
    description: string;
    icon: string;
    tips?: string[];
}

interface AccommodationRoadmapProps {
    onBack: () => void;
}

const AccommodationRoadmap: React.FC<AccommodationRoadmapProps> = ({ onBack }) => {
    const steps: RoadmapStep[] = [
        {
            number: 1,
            title: "Elección del Tipo",
            description: "¿Te quedas en un hotel o con un familiar? Esta decisión cambia totalmente los documentos que debes presentar ante el consulado.",
            icon: "home",
            tips: ["Hotel: Necesitas reserva confirmada.", "Familiar: Necesitas Carta de Invitación oficial."]
        },
        {
            number: 2,
            title: "Reserva en Plataformas",
            description: "Usa sitios como Booking.com o Expedia. Busca opciones con 'Cancelación Gratuita' y 'Sin Pago por Adelantado' para proteger tu dinero.",
            icon: "hotel",
            tips: ["Asegúrate de que la reserva cubra el 100% de las noches de tu estancia."]
        },
        {
            number: 3,
            title: "Carta de Invitación (Si aplica)",
            description: "Si te invita un residente en España, él debe tramitar la carta oficial en la Comisaría de Policía de su ciudad. No basta con una carta escrita a mano.",
            icon: "mail",
            tips: ["Este trámite puede tardar de 2 a 4 semanas; dile a tu anfitrión que empiece pronto."]
        },
        {
            number: 4,
            title: "Coherencia de Datos",
            description: "La dirección del hotel o casa debe ser la misma que pongas en el formulario de solicitud y debe coincidir con tus fechas de vuelo.",
            icon: "checklist",
            tips: ["Cualquier discrepancia de fechas es motivo de duda para el oficial consular."]
        },
        {
            number: 5,
            title: "Descarga y Carga",
            description: "Obtén el PDF de confirmación (en español si es posible) y súbelo a Go-Check para que lo tengamos listo en tu expediente.",
            icon: "cloud_done",
            tips: ["Lleva siempre una copia impresa el día de la cita."]
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
                        <h1 className="text-white font-bold text-lg">Hoja de Ruta: Alojamiento</h1>
                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Garantía de Estancia</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Requisito de Vivienda</span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Tu Lugar de Estancia</h2>
                    <p className="text-slate-400 text-sm max-w-md mx-auto">Sigue estos pasos para demostrar ante el consulado que tienes un lugar seguro donde dormir en Europa.</p>
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
                                            <span className="material-icons text-cyan-400 text-[16px] mt-0.5">verified</span>
                                            <span className="text-[11px] text-cyan-100/80 font-medium leading-tight">{tip}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Model / Template Download Area */}
                <div className="mt-16 bg-gradient-to-br from-cyan-900/20 to-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
                    <div className="flex items-center justify-center w-16 h-16 bg-cyan-400/10 rounded-2xl mx-auto mb-6">
                        <span className="material-icons text-cyan-400 text-3xl">description</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Recursos Útiles</h3>
                    <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                        Si tu anfitrión necesita un modelo de referencia para los datos que pide la policía en la carta, descarga nuestra guía.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/templates/modelo-carta-invitacion.pdf"
                            download
                            className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-4 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                        >
                            <span className="material-icons">download</span>
                            DESCARGAR MODELO CARTA
                        </a>
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

export default AccommodationRoadmap;
