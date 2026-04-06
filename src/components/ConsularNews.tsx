import React from 'react';

interface NewsItem {
    id: string;
    source: string;
    sourceAlias: string;
    content: string;
    date: string;
    type: 'alert' | 'update' | 'info';
    platform: 'x' | 'facebook';
}

const ConsularNews: React.FC = () => {
    const news: NewsItem[] = [
        {
            id: '1',
            source: 'Cancillería Ecuador',
            sourceAlias: '@CancilleriaEc',
            content: 'Nuevas disposiciones para la solicitud de visas de residencia temporal. Se requiere validación biométrica obligatoria en consulados de España e Italia.',
            date: 'Hoy, 10:30 AM',
            type: 'alert',
            platform: 'x'
        },
        {
            id: '2',
            source: 'Consulado Madrid',
            sourceAlias: '@ConsulEcMadrid',
            content: '¡Atención! Se han habilitado 500 nuevos turnos para pasaportes y apostillas para el mes de Mayo. Reserva únicamente vía web oficial.',
            date: 'Ayer',
            type: 'update',
            platform: 'x'
        },
        {
            id: '3',
            source: 'Migración Ecuador',
            sourceAlias: 'facebook.com/MigracionEc',
            content: 'Recordamos a los ciudadanos en el exterior que la prórroga de pasaportes ha sido extendida. Consulta los requisitos en nuestra fanpage.',
            date: '2 d ago',
            type: 'info',
            platform: 'facebook'
        }
    ];

    return (
        <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl shadow-black/5 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">ACTUALIDAD NOTICIAS MIGRATORIAS</h3>
                </div>
                <div className="flex gap-2">
                     <span className="material-icons text-slate-400 text-sm">rss_feed</span>
                </div>
            </div>

            {/* Banner Principal (Importante) */}
            <div className="p-4 bg-primary/10 border-b border-primary/10">
                <div className="flex items-center gap-2 mb-1">
                     <span className="material-icons text-primary text-xs font-bold">campaign</span>
                     <span className="text-[10px] font-bold text-primary uppercase">Urgente - Europa</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    España y Ecuador firman nuevo acuerdo de homologación de licencias de conducir para residentes.
                </p>
            </div>

            {/* News List */}
            <div className="flex-1 overflow-y-auto max-h-[300px] scrollbar-hide">
                {news.map((item) => (
                    <div key={item.id} className="p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                    {item.platform === 'x' ? (
                                        <span className="text-[10px] font-bold font-serif italic text-slate-900 dark:text-white">X</span>
                                    ) : (
                                        <span className="material-icons text-[14px] text-blue-600">facebook</span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-bold text-slate-900 dark:text-white leading-none">{item.source}</h4>
                                    <span className="text-[9px] text-slate-500">{item.sourceAlias}</span>
                                </div>
                            </div>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">{item.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                            "{item.content}"
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                            <button className="text-[9px] font-bold text-primary flex items-center gap-1 hover:underline">
                                <span className="material-icons text-[10px]">link</span> Ver original
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 text-center">
                <button className="text-[10px] font-bold text-slate-500 hover:text-primary transition-colors">
                    Ver más actualizaciones migratorias
                </button>
            </div>
        </div>
    );
};

export default ConsularNews;
