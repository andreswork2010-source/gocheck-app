import React from 'react';

interface RoadmapStep {
    number: number;
    title: string;
    description: string;
    icon: string;
    tips?: string[];
}

interface PhotoRoadmapProps {
    onBack: () => void;
}

const PhotoRoadmap: React.FC<PhotoRoadmapProps> = ({ onBack }) => {
    const steps: RoadmapStep[] = [
        {
            number: 1,
            title: "Dimensiones Exactas",
            description: "La foto debe medir exactamente 35mm x 45mm. Este es el estándar ICAO para fotos biométricas Schengen.",
            icon: "photo_size_select_large",
            tips: ["No uses fotos de pasaporte antiguo si tienen más de 6 meses."]
        },
        {
            number: 2,
            title: "Fondo y Expresión",
            description: "Fondo completamente blanco o gris claro. Rostro neutro, boca cerrada, mirando directamente a la cámara.",
            icon: "face",
            tips: ["No sonrías ni hagas gestos.", "Evita sombras en el rostro o en el fondo."]
        },
        {
            number: 3,
            title: "Vestimenta y Accesorios",
            description: "Ropa de uso diario (no uniformes). Si usas lentes, que no tengan reflejo. No gorros ni accesorios que cubran el rostro.",
            icon: "checkroom",
            tips: ["Excepción: Pañuelos religiosos permitidos si no cubren el rostro."]
        },
        {
            number: 4,
            title: "Calidad de Impresión",
            description: "Papel fotográfico de alta calidad. La imagen debe estar enfocada, sin pixelación ni manchas.",
            icon: "high_quality",
            tips: ["No uses impresoras caseras. Ve a un estudio fotográfico profesional."]
        },
        {
            number: 5,
            title: "Cantidad y Vigencia",
            description: "Lleva 2 fotos idénticas y recientes (máximo 6 meses de antigüedad). Una se pega al formulario, otra queda en tu expediente.",
            icon: "content_copy",
            tips: ["Guarda el archivo digital por si necesitas reimprimir."]
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
                        <h1 className="text-white font-bold text-lg">Hoja de Ruta: Fotografía</h1>
                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Foto Biométrica Schengen</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-purple-400/10 px-3 py-1 rounded-full border border-purple-400/20">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Norma ICAO</span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Tu Foto para la Visa</h2>
                    <p className="text-slate-400 text-sm max-w-md mx-auto">Cumple con los requisitos biométricos internacionales para evitar que rechacen tu solicitud por un detalle técnico.</p>
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
                                            <span className="material-icons text-cyan-400 text-[16px] mt-0.5">lightbulb</span>
                                            <span className="text-[11px] text-cyan-100/80 font-medium leading-tight">{tip}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Visual Example */}
                <div className="mt-16 bg-gradient-to-br from-purple-900/20 to-slate-900 border border-purple-400/30 rounded-3xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6 text-center">📐 Especificaciones Técnicas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <h4 className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
                                <span className="material-icons text-sm">check_circle</span>
                                CORRECTO
                            </h4>
                            <ul className="text-slate-300 text-sm space-y-1">
                                <li>• Rostro ocupa 70-80% de la foto</li>
                                <li>• Cabeza centrada</li>
                                <li>• Ojos abiertos y visibles</li>
                                <li>• Iluminación uniforme</li>
                            </ul>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                                <span className="material-icons text-sm">cancel</span>
                                INCORRECTO
                            </h4>
                            <ul className="text-slate-300 text-sm space-y-1">
                                <li>• Foto de perfil o ángulo</li>
                                <li>• Filtros o edición digital</li>
                                <li>• Ojos rojos o cerrados</li>
                                <li>• Fondo con patrones</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Recommended Studios */}
                <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="material-icons text-cyan-400">store</span>
                        ¿Dónde tomarme la foto?
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">
                        Busca estudios fotográficos que especifiquen "Fotos para Visa Schengen" o "Fotos Biométricas".
                        El costo promedio en Ecuador es de <strong className="text-white">$3 a $8</strong> por el set de 2 fotos.
                    </p>
                    <p className="text-cyan-400 text-xs">
                        💡 Pro-Tip: Lleva ropa oscura (azul marino, negro) para mejor contraste con el fondo blanco.
                    </p>
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

export default PhotoRoadmap;
