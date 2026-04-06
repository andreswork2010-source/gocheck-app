import { useState } from 'react';
import { type ImportantDate } from '../utils/scoring';

interface VisaCalendarProps {
    onBack: () => void;
    importantDates: ImportantDate[];
    onAddDate: (date: ImportantDate) => void;
    onDeleteDate: (id: string) => void;
    companions?: { id: string, name: string }[];
}

export default function VisaCalendar({ onBack, importantDates, onAddDate, onDeleteDate, companions = [] }: VisaCalendarProps) {

    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newType, setNewType] = useState<ImportantDate['type']>('appointment');
    const [selectedMemberId, setSelectedMemberId] = useState<string>('titular');



    // Get family members from some parent state? 
    // In App.tsx userProfile has companions. Let's assume onAddDate can handle it if we pass memberId.


    const handleAdd = () => {
        if (!newTitle || !newDate) return;
        const member = selectedMemberId === 'titular' ? { name: 'Titular' } : companions.find(c => c.id === selectedMemberId);
        onAddDate({
            id: crypto.randomUUID(),
            title: newTitle,
            date: newDate,
            type: newType,
            memberId: selectedMemberId,
            memberName: member?.name || 'Acompañante',
            notified: false
        });
        setNewTitle('');
        setNewDate('');
        setIsAdding(false);
    };

    const sortedDates = [...importantDates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const getTypeIcon = (type: ImportantDate['type']) => {
        switch (type) {
            case 'appointment': return 'event_available';
            case 'submission': return 'description';
            case 'expiration': return 'warning';
            case 'flight': return 'flight_takeoff';
            default: return 'calendar_today';
        }
    };

    const getTypeColor = (type: ImportantDate['type']) => {
        switch (type) {
            case 'appointment': return 'text-primary bg-primary/10';
            case 'submission': return 'text-amber-500 bg-amber-500/10';
            case 'expiration': return 'text-red-500 bg-red-500/10';
            case 'flight': return 'text-blue-500 bg-blue-500/10';
            default: return 'text-slate-500 bg-slate-500/10';
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-background-light dark:bg-background-dark flex flex-col font-display">
            {/* Header */}
            <header className="p-4 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-icons">arrow_back</span>
                    </button>
                    <div>
                        <h2 className="text-slate-900 dark:text-white font-bold text-lg">Agenda de Viaje</h2>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Fechas Importantes</p>
                    </div>
                </div>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform"
                >
                    <span className="material-icons text-sm">add</span>
                    Evento
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                <div className="w-full max-w-2xl space-y-6">
                    {sortedDates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                                <span className="material-icons text-4xl">calendar_month</span>
                            </div>
                            <div>
                                <h3 className="text-slate-900 dark:text-white font-bold">Sin fechas registradas</h3>
                                <p className="text-slate-500 text-sm max-w-xs">Agrega tus citas consulares, vencimiento de pasaporte o fechas de vuelo para recibir avisos.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedDates.map((date) => {
                                const d = new Date(date.date);
                                const isPast = d < new Date(new Date().setHours(0,0,0,0));
                                
                                return (
                                    <div 
                                      key={date.id} 
                                      className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                                        isPast ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
                                      }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeColor(date.type)}`}>
                                            <span className="material-icons">{getTypeIcon(date.type)}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h4 className="text-slate-900 dark:text-white font-bold">{date.title}</h4>
                                                {date.memberName && (
                                                    <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full font-bold uppercase">
                                                        {date.memberName}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-500 text-sm flex items-center gap-1">
                                                <span className="material-icons text-xs">schedule</span>
                                                {new Date(date.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <button 
                                          onClick={() => onDeleteDate(date.id)}
                                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <span className="material-icons">delete</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de Agregado */}
            {isAdding && (
                <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl animate-scaleIn">
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/10">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Nuevo Evento</h3>
                            <p className="text-slate-500 text-sm">No olvides tus fechas importantes.</p>
                        </div>
                        <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">¿Para quién?</label>
                                    <select 
                                      value={selectedMemberId}
                                      onChange={e => setSelectedMemberId(e.target.value)}
                                      className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 ring-primary/50 transition-all font-medium appearance-none"
                                    >
                                        <option value="titular">Para mí</option>
                                        {companions.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Concepto</label>
                                    <input 
                                      value={newTitle}
                                      onChange={e => setNewTitle(e.target.value)}
                                      placeholder="Ej: Cita en BLS Quito"
                                      className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 ring-primary/50 transition-all font-medium"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Fecha</label>
                                        <input 
                                          type="date"
                                          value={newDate}
                                          onChange={e => setNewDate(e.target.value)}
                                          className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 ring-primary/50 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Tipo</label>
                                        <select 
                                          value={newType}
                                          onChange={e => setNewType(e.target.value as any)}
                                          className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 ring-primary/50 transition-all font-medium appearance-none"
                                        >
                                            <option value="appointment">Cita Consular</option>
                                            <option value="submission">Presentación</option>
                                            <option value="flight">Vuelo</option>
                                            <option value="expiration">Vencimiento</option>
                                            <option value="other">Otro</option>
                                        </select>
                                    </div>
                                </div>
                        </div>
                        <div className="p-6 flex gap-3">
                            <button 
                              onClick={() => setIsAdding(false)}
                              className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                              onClick={handleAdd}
                              className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
