import { useState } from 'react';
import { type ImportantDate } from '../utils/scoring';

interface NotificationBellProps {
    dates: ImportantDate[];
    onOpenCalendar: () => void;
}

export default function NotificationBell({ dates, onOpenCalendar }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Filter upcoming dates (next 7 days) and important ones like expiration
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = dates.filter(d => {
        const eventDate = new Date(d.date);
        const diffDays = (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 15; // Show notifications for next 15 days
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="relative font-display">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-all relative"
            >
                <span className="material-icons">notifications</span>
                {upcoming.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 animate-pulse">
                        {upcoming.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-[100]" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-[101] animate-scaleIn origin-top-right">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Notificaciones</h3>
                            <button onClick={onOpenCalendar} className="text-[10px] font-bold text-primary hover:underline uppercase">Ver Agenda</button>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                            {upcoming.length === 0 ? (
                                <div className="p-8 text-center">
                                    <span className="material-icons text-slate-300 dark:text-slate-600 text-3xl mb-2">notifications_none</span>
                                    <p className="text-sm text-slate-500">No tienes alertas pendientes</p>
                                </div>
                            ) : (
                                upcoming.map((date) => {
                                    const eventDate = new Date(date.date);
                                    const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                    
                                    return (
                                        <div 
                                          key={date.id} 
                                          className="p-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                                          onClick={() => {
                                              setIsOpen(false);
                                              onOpenCalendar();
                                          }}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                    date.type === 'expiration' ? 'bg-red-100 text-red-500' : 'bg-primary/10 text-primary'
                                                }`}>
                                                    <span className="material-icons text-sm">
                                                        {date.type === 'expiration' ? 'warning' : 'event'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{date.title}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {diffDays === 0 ? '¡Cuidado, es hoy!' : 
                                                         diffDays === 1 ? 'Mañana será la fecha' : 
                                                         `Faltan ${diffDays} días`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )
                            }
                        </div>
                        
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 text-center">
                            <button 
                              onClick={() => {
                                setIsOpen(false);
                                onOpenCalendar();
                              }}
                              className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                            >
                                Gestionar mis fechas
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
