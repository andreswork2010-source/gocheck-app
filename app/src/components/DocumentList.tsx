import React, { useMemo, useState, useEffect } from 'react';
import { VISA_DATA } from '../data/visaData';

interface UploadedFile {
    file: File | null; // null if loaded from local storage (just metadata)
    previewUrl?: string; // For images or PDF dataUrls
    fileName: string;
}

interface DocumentListProps {
    onBack: () => void;
    destinationId: string;
    visaTypeId: string;
    files: Record<string, UploadedFile>;
    setFiles: React.Dispatch<React.SetStateAction<Record<string, UploadedFile>>>;
    onNavigate?: (view: string) => void;
}

interface PassportData {
    number: string;
    issueDate: string;
    expiryDate: string;
}

interface FlightData {
    departureDate: string;
    departureTime: string;
    arrivalDate: string;
    arrivalTime: string;
    pnr: string;
}

const DocumentList: React.FC<DocumentListProps> = ({ onBack, destinationId, visaTypeId, files, setFiles, onNavigate }) => {

    // Resolve data based on props
    const country = VISA_DATA.find(c => c.id === destinationId);
    const visa = country?.visas.find(v => v.id === visaTypeId);

    // State for Passport Data
    const [passportData, setPassportData] = useState<PassportData>({
        number: '',
        issueDate: '',
        expiryDate: ''
    });

    // State for Flight Data
    const [flightData, setFlightData] = useState<FlightData>({
        departureDate: '',
        departureTime: '',
        arrivalDate: '',
        arrivalTime: '',
        pnr: ''
    });

    const [showPassportForm, setShowPassportForm] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        const savedPassportData = localStorage.getItem('passportData');
        if (savedPassportData) setPassportData(JSON.parse(savedPassportData));

        const savedFlightData = localStorage.getItem('flightData');
        if (savedFlightData) setFlightData(JSON.parse(savedFlightData));

        const savedUploads = localStorage.getItem('uploadsMeta');
        if (savedUploads && Object.keys(files).length === 0) setFiles(JSON.parse(savedUploads));
    }, []);

    const saveAllData = () => {
        localStorage.setItem('passportData', JSON.stringify(passportData));
        localStorage.setItem('flightData', JSON.stringify(flightData));

        const metaToSave = Object.entries(files).reduce((acc, [key, val]) => {
            acc[key] = { fileName: val.fileName, file: null, previewUrl: val.previewUrl };
            return acc;
        }, {} as Record<string, any>);
        localStorage.setItem('uploadsMeta', JSON.stringify(metaToSave));

        setHasUnsavedChanges(false);
    };

    const handleFileUpload = (reqId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const newUpload = {
                file: file,
                fileName: file.name,
                previewUrl: (file.type.startsWith('image/') || file.type === 'application/pdf') ? URL.createObjectURL(file) : undefined
            };

            setFiles(prev => {
                const updated = { ...prev, [reqId]: newUpload };
                setHasUnsavedChanges(true);
                return updated;
            });

            if (reqId === 'pass') setShowPassportForm(true);
        }
    };

    const handleFileDelete = (reqId: string) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este documento?")) {
            setFiles(prev => {
                const updated = { ...prev };
                delete updated[reqId];
                return updated;
            });
            setHasUnsavedChanges(true);
            if (reqId === 'pass') setShowPassportForm(false);
        }
    };

    const triggerFileInput = (reqId: string) => {
        document.getElementById(`file-input-${reqId}`)?.click();
    };

    const handlePassportChange = (field: keyof PassportData, value: string) => {
        setPassportData(prev => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
    }

    const handleBackWithSave = () => {
        if (hasUnsavedChanges) {
            if (window.confirm("Tienes cambios sin guardar. ¿Deseas guardarlos antes de salir?")) {
                saveAllData();
            }
        }
        onBack();
    };

    const requirements = useMemo(() => {
        if (!visa) return [];
        return [...visa.requirements].sort((a, b) => {
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (a.priority !== 'high' && b.priority === 'high') return 1;
            return 0;
        });
    }, [visa]);

    const renderRequirementItem = (req: any) => {
        const isUploaded = !!files[req.id];
        const uploadedFile = files[req.id];
        const isPassport = req.id === 'pass';

        return (
            <div key={req.id} className="flex flex-col gap-4">
                <div className={`bg-white dark:bg-slate-900/50 rounded-2xl p-4 border flex items-center gap-4 transition-all group ${isUploaded ? 'border-status-green bg-status-green/5' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isUploaded ? 'bg-status-green' : (req.priority === 'high' ? 'bg-status-yellow/10' : 'bg-slate-100 dark:bg-slate-800')}`}>
                        <span className={`material-icons ${isUploaded ? 'text-white' : (req.priority === 'high' ? 'text-status-yellow' : 'text-slate-400')}`}>
                            {isUploaded ? 'check' : (req.priority === 'high' ? 'priority_high' : 'description')}
                        </span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-bold truncate ${isUploaded ? 'text-status-green' : 'text-slate-900 dark:text-white'}`}>
                            {req.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {isUploaded ? `Archivo: ${uploadedFile?.fileName}` : req.description}
                        </p>
                    </div>

                    <input type="file" id={`file-input-${req.id}`} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(req.id, e)} />

                    <div className="flex items-center gap-2">
                        {isUploaded ? (
                            <>
                                {uploadedFile?.previewUrl && (
                                    <a href={uploadedFile.previewUrl} download={uploadedFile.fileName} className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20" title="Descargar">
                                        <span className="material-icons text-sm">download</span>
                                    </a>
                                )}
                                <button onClick={() => handleFileDelete(req.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100" title="Eliminar">
                                    <span className="material-icons text-sm">delete</span>
                                </button>
                                <button onClick={() => triggerFileInput(req.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200" title="Editar">
                                    <span className="material-icons text-sm">edit</span>
                                </button>
                                {isPassport && (
                                    <button onClick={() => setShowPassportForm(!showPassportForm)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20" title="Datos Pasaporte">
                                        <span className="material-icons text-sm">edit_note</span>
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="flex gap-2">
                                {req.id === 'generated_visa_form' && (
                                    <a
                                        href="https://www.ilovepdf.com/edit-pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1"
                                    >
                                        <span className="material-icons text-sm">edit</span>
                                        LLENAR
                                    </a>
                                )}
                                <button onClick={() => triggerFileInput(req.id)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700">
                                    SUBIR
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {isPassport && showPassportForm && (
                    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 ml-4">
                        <h4 className="text-xs font-bold mb-3 uppercase flex items-center gap-2"><span className="material-icons text-primary text-sm">badge</span> Detalle Pasaporte</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input type="text" className="bg-white dark:bg-slate-900 border rounded-lg px-3 py-2 text-xs" placeholder="Número" value={passportData.number} onChange={(e) => handlePassportChange('number', e.target.value)} />
                            <input type="date" className="bg-white dark:bg-slate-900 border rounded-lg px-3 py-2 text-xs" value={passportData.issueDate} onChange={(e) => handlePassportChange('issueDate', e.target.value)} />
                            <input type="date" className="bg-white dark:bg-slate-900 border rounded-lg px-3 py-2 text-xs" value={passportData.expiryDate} onChange={(e) => handlePassportChange('expiryDate', e.target.value)} />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (!country || !visa) return <div className="p-10 text-center">Datos no encontrados</div>;

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen font-display flex flex-col">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={handleBackWithSave} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"><span className="material-icons">chevron_left</span></button>
                    <div>
                        <h1 className="text-lg font-bold">Documentación</h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{country.name} • {visa.name}</p>
                    </div>
                </div>
                <button onClick={saveAllData} disabled={!hasUnsavedChanges} className={`px-4 py-2 rounded-lg text-xs font-bold ${hasUnsavedChanges ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                    {hasUnsavedChanges ? 'GUARDAR CAMBIOS' : 'GUARDADO'}
                </button>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section>
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[.2em] mb-4">Obligatorios</h2>
                    <div className="space-y-3">{requirements.filter(r => r.priority === 'high').map(renderRequirementItem)}</div>
                </section>
                <section>
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[.2em] mb-4">Complementarios</h2>
                    <div className="space-y-3">{requirements.filter(r => r.priority !== 'high').map(renderRequirementItem)}</div>
                </section>
            </main>
        </div>
    );
};

export default DocumentList;
