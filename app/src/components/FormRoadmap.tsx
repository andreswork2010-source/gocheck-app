import React from 'react';

interface RoadmapStep {
    number: number;
    title: string;
    description: string;
    icon: string;
    tips?: string[];
}

interface FormRoadmapProps {
    onBack: () => void;
}

const FormRoadmap: React.FC<FormRoadmapProps> = ({ onBack }) => {
    const steps: RoadmapStep[] = [
        {
            number: 1,
            title: "Descarga el Formulario Oficial",
            description: "Usa SIEMPRE el formulario actualizado del consulado. No uses versiones antiguas ni de terceros.",
            icon: "download",
            tips: ["Go-Check tiene el formulario oficial en la sección de Documentos."]
        },
        {
            number: 2,
            title: "Datos Personales (Secciones 1-4)",
            description: "Nombre completo EXACTAMENTE como aparece en tu pasaporte. Fecha y lugar de nacimiento, nacionalidad actual y de origen.",
            icon: "person",
            tips: ["Si tienes doble nacionalidad, declárala.", "Usa MAYÚSCULAS para nombres y apellidos."]
        },
        {
            number: 3,
            title: "Datos del Viaje (Secciones 21-24)",
            description: "Propósito del viaje (turismo, negocios, visita familiar). Fechas de entrada y salida. País de destino principal.",
            icon: "flight",
            tips: ["El país de 'destino principal' es donde pasarás más noches.", "Las fechas deben coincidir con tu vuelo y seguro."]
        },
        {
            number: 4,
            title: "Alojamiento y Medios de Subsistencia",
            description: "Indica dónde te quedarás (hotel o anfitrión) y cómo pagarás el viaje (efectivo, tarjeta, patrocinador).",
            icon: "hotel",
            tips: ["Si marcas 'patrocinador', debes adjuntar carta de invitación oficial."]
        },
        {
            number: 5,
            title: "Datos Laborales y Familiares",
            description: "Profesión actual, empleador, datos de contacto. Estado civil y datos del cónyuge si aplica.",
            icon: "work",
            tips: ["Si eres independiente, indica 'Trabajador Autónomo' y tu actividad."]
        },
        {
            number: 6,
            title: "Firma y Fecha",
            description: "Firma a mano con bolígrafo azul o negro. La fecha debe ser reciente (máximo 1 mes antes de la cita).",
            icon: "edit",
            tips: ["NO firmes digitalmente. Debe ser firma manuscrita.", "Firma DESPUÉS de imprimir, no antes."]
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
                        <h1 className="text-white font-bold text-lg">Hoja de Ruta: Formulario</h1>
                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Solicitud Schengen</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Documento Central</span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Llenar el Formulario</h2>
                    <p className="text-slate-400 text-sm max-w-md mx-auto">Guía paso a paso para completar tu solicitud de visa Schengen sin errores que puedan retrasar tu proceso.</p>
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
                                            <span className="material-icons text-cyan-400 text-[16px] mt-0.5">info</span>
                                            <span className="text-[11px] text-cyan-100/80 font-medium leading-tight">{tip}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Common Mistakes */}
                <div className="mt-16 bg-gradient-to-br from-red-900/20 to-slate-900 border border-red-400/30 rounded-3xl p-8">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-icons text-red-400">error</span>
                        Errores Frecuentes que Debes Evitar
                    </h3>
                    <ul className="space-y-3 text-slate-300 text-sm">
                        <li className="flex items-start gap-2">
                            <span className="text-red-400">✗</span>
                            <span>Dejar campos en blanco (escribe "N/A" si no aplica)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-400">✗</span>
                            <span>Usar corrector líquido o tachones (si te equivocas, imprime uno nuevo)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-400">✗</span>
                            <span>Fechas que no coinciden con vuelo/seguro/alojamiento</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-400">✗</span>
                            <span>Firmar antes de imprimir (la tinta debe verse real)</span>
                        </li>
                    </ul>
                </div>

                {/* Helper Tool */}
                <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="material-icons text-cyan-400">auto_fix_high</span>
                        Herramienta de Go-Check
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">
                        En la sección <strong className="text-white">Formularios</strong> de Go-Check, puedes llenar el formulario digitalmente
                        con tus datos guardados y luego descargarlo listo para imprimir y firmar.
                    </p>
                    <button
                        onClick={onBack}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-cyan-400/20 flex items-center gap-2"
                    >
                        <span className="material-icons">description</span>
                        IR A FORMULARIOS
                    </button>
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

export default FormRoadmap;
