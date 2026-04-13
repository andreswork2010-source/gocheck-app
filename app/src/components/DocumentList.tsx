import React, { useMemo, useState, useEffect } from 'react';
import { VISA_DATA } from '../data/visaData';
import PhotoStudio from './PhotoStudio';
import { type UserProfile } from '../utils/scoring';
import { sendProgressEmail } from '../lib/mailService';


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
    setFiles: (newFiles: Record<string, UploadedFile> | ((prev: Record<string, UploadedFile>) => Record<string, UploadedFile>)) => Promise<void>;
    userProfile: UserProfile | null;
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

const DocumentList: React.FC<DocumentListProps> = ({ onBack, destinationId, visaTypeId, files, setFiles, userProfile }) => {

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
    const [showPhotoStudio, setShowPhotoStudio] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const companions = userProfile?.companions || [];
    const [activeMemberId, setActiveMemberId] = useState<string>('titular');
    
    const getFileKey = (reqId: string) => activeMemberId === 'titular' ? reqId : `${reqId}_${activeMemberId}`;
    
    const activeMember = activeMemberId === 'titular' 
        ? null 
        : companions.find(c => c.id === activeMemberId);

    const isMinor = activeMember ? parseInt(activeMember.age) < 18 : false;

    useEffect(() => {
        const savedPassportData = localStorage.getItem('passportData');
        if (savedPassportData) setPassportData(JSON.parse(savedPassportData));

        const savedFlightData = localStorage.getItem('flightData');
        if (savedFlightData) setFlightData(JSON.parse(savedFlightData));
    }, []);

    const saveAllData = () => {
        localStorage.setItem('passportData', JSON.stringify(passportData));
        localStorage.setItem('flightData', JSON.stringify(flightData));
        setHasUnsavedChanges(false);
    };

    const handleFileUpload = (fileKey: string, _isHighPriority: boolean, reqTitle: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const newUpload = {
                file: file,
                fileName: file.name,
                previewUrl: (file.type.startsWith('image/') || file.type === 'application/pdf') ? URL.createObjectURL(file) : undefined
            };

            setFiles(prev => {
                const updated = { ...prev, [fileKey]: newUpload };
                setHasUnsavedChanges(true);
                return updated;
            });

            if (fileKey.startsWith('pass')) setShowPassportForm(true);

            // Send notification of progress (Titular only to avoid spamming)
            if (userProfile?.email && userProfile && activeMemberId === 'titular') {
                const totalHighPriority = requirements.filter(r => r.priority === 'high').length;
                const uploadedHighPriority = Object.keys({ ...files, [fileKey]: newUpload }).filter(key => 
                    requirements.find(r => r.id === key && r.priority === 'high')
                ).length;
                
                const percentage = Math.round((uploadedHighPriority / totalHighPriority) * 100);

                sendProgressEmail(userProfile.email, userProfile.firstName, reqTitle, percentage)
                    .catch(err => console.error("Error sending progress email:", err));
            }
        }
    };

    const handleFileDelete = (fileKey: string) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este documento?")) {
            setFiles(prev => {
                const updated = { ...prev };
                delete updated[fileKey];
                return updated;
            });
            setHasUnsavedChanges(true);
            if (fileKey.startsWith('pass')) setShowPassportForm(false);
        }
    };

    const handleManualCheck = (fileKey: string) => {
        setFiles(prev => {
            const updated = { ...prev, [fileKey]: { file: null, fileName: 'Marcado Manualmente' } };
            setHasUnsavedChanges(true);
            return updated;
        });
    };

    const handlePhotoCapture = async (dataUrl: string) => {
        try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], "foto_biometrica.jpg", { type: "image/jpeg" });
            
            const newUpload = {
                file: file,
                fileName: file.name,
                previewUrl: dataUrl
            };

            const fileKey = getFileKey('photo');
            setFiles(prev => {
                const updated = { ...prev, [fileKey]: newUpload };
                setHasUnsavedChanges(true);
                return updated;
            });
            
            setShowPhotoStudio(false);
        } catch (error) {
            console.error("Error saving captured photo:", error);
            alert("No pudimos guardar la foto. Intenta de nuevo.");
        }
    };


    const triggerFileInput = (fileKey: string) => {
        document.getElementById(`file-input-${fileKey}`)?.click();
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
        let reqs = [...visa.requirements];
        
        if (isMinor) {
             reqs = reqs.filter(r => r.id !== 'financial' && r.id !== 'employment');
             
             if (!reqs.find(r => r.id === 'birth_cert')) {
                 reqs.push({
                     id: 'birth_cert',
                     title: 'Registro/Certificado de Nacimiento',
                     description: 'Copia del acta de nacimiento del menor apostillada.',
                     priority: 'high',
                     status: 'pending'
                 });
                 reqs.push({
                     id: 'parent_consent',
                     title: 'Permiso de Salida del País',
                     description: 'Autorización notariada si viaja sin un padre.',
                     priority: 'high',
                     status: 'pending'
                 });
             }
        }
        
        return reqs.sort((a, b) => {
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (a.priority !== 'high' && b.priority === 'high') return 1;
            return 0;
        });
    }, [visa, isMinor]);

    const renderRequirementItem = (req: any) => {
        const fileKey = getFileKey(req.id);
        const isUploaded = !!files[fileKey];
        const uploadedFile = files[fileKey];
        const isPassport = req.id === 'pass';

        return (
            <div key={fileKey} className="flex flex-col gap-4">
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
                            {isUploaded ? (uploadedFile?.fileName === 'Marcado Manualmente' ? 'Completado (Sin archivo adjunto)' : `Archivo: ${uploadedFile?.fileName}`) : req.description}
                        </p>
                    </div>

                    <input type="file" id={`file-input-${fileKey}`} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(fileKey, req.priority === 'high', req.title, e)} />

                    <div className="flex items-center gap-2">
                        {isUploaded ? (
                            <>
                                {uploadedFile?.previewUrl && (
                                    <a href={uploadedFile.previewUrl} download={uploadedFile.fileName} className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20" title="Descargar">
                                        <span className="material-icons text-sm">download</span>
                                    </a>
                                )}
                                <button onClick={() => handleFileDelete(fileKey)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100" title="Eliminar">
                                    <span className="material-icons text-sm">delete</span>
                                </button>
                                <button onClick={() => triggerFileInput(fileKey)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200" title="Editar">
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
                                        href="/forms/formulario_schengen_es.pdf"
                                        download="formulario_schengen_es.pdf"
                                        className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1"
                                    >
                                        <span className="material-icons text-sm">download</span>
                                        DESCARGAR FORMULARIO
                                    </a>
                                )}
                                {req.id === 'photo' && (
                                    <button
                                        onClick={() => setShowPhotoStudio(true)}
                                        className="px-4 py-2 bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 rounded-lg text-xs font-bold hover:bg-cyan-500/20 transition-colors flex items-center gap-1"
                                    >
                                        <span className="material-icons text-sm">photo_camera</span>
                                        TOMAR CON GO-CHECK
                                    </button>
                                )}
                                {/* MONETIZACIÓN: TravelPayouts Affiliate Buttons */}
                                {(req.id === 'flight' || req.id === 'flight_reservation') && (
                                    <a
                                        href={`https://tp.media/r?marker=703875&p=2422&u=https://www.aviasales.com`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-colors flex items-center gap-1"
                                    >
                                        <span className="material-icons text-sm">flight</span>
                                        RESERVAR VUELO
                                    </a>
                                )}
                                {(req.id === 'insurance' || req.id === 'travel_insurance') && (
                                    <a
                                        href={`https://tp.media/r?marker=703875&p=3453&u=https://ectatravel.com`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                                    >
                                        <span className="material-icons text-sm">health_and_safety</span>
                                        CONTRATAR SEGURO
                                    </a>
                                )}
                                {(req.id === 'accommodation' || req.id === 'hotel_booking') && (
                                    <a
                                        href={`https://tp.media/r?marker=703875&p=1214&u=https://www.booking.com`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-lg text-xs font-bold hover:bg-amber-500/20 transition-colors flex items-center gap-1"
                                    >
                                        <span className="material-icons text-sm">hotel</span>
                                        RESERVAR HOTEL
                                    </a>
                                )}
                                
                                <button onClick={() => triggerFileInput(fileKey)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700">
                                    SUBIR
                                </button>
                                <button onClick={() => handleManualCheck(fileKey)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-status-green hover:text-white transition-colors flex items-center gap-1" title="Marcar como cumplido sin subir archivo">
                                    <span className="material-icons text-sm">check</span> LISTO
                                </button>
                            </div>
                        )}
                    </div>

                </div>

                {isPassport && showPassportForm && (
                    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 ml-4">
                        <h4 className="text-xs font-bold mb-3 uppercase flex items-center gap-2"><span className="material-icons text-primary text-sm">badge</span> Detalle Pasaporte</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Número</label>
                                <input type="text" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Ej: 124812354" value={passportData.number} onChange={(e) => handlePassportChange('number', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Fecha Emisión</label>
                                <input type="date" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={passportData.issueDate} onChange={(e) => handlePassportChange('issueDate', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Fecha Vencimiento</label>
                                <input type="date" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={passportData.expiryDate} onChange={(e) => handlePassportChange('expiryDate', e.target.value)} />
                            </div>
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
                {companions.length > 0 && (
                    <div className="col-span-1 lg:col-span-2 mb-2 flex flex-wrap gap-2">
                        <button 
                            onClick={() => setActiveMemberId('titular')}
                            className={`px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeMemberId === 'titular' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-300'}`}
                        >
                            <span className="material-icons text-sm">account_circle</span>
                            {userProfile?.firstName || 'Titular'}
                        </button>
                        {companions.map((comp: any) => (
                            <button
                                key={comp.id}
                                onClick={() => setActiveMemberId(comp.id)}
                                className={`px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeMemberId === comp.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-300'}`}
                            >
                                <span className="material-icons text-sm">{parseInt(comp.age) < 18 ? 'child_care' : 'person_outline'}</span>
                                {comp.name}
                            </button>
                        ))}
                    </div>
                )}
                
                <section>
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[.2em] mb-4">Obligatorios</h2>
                    <div className="space-y-3">{requirements.filter(r => r.priority === 'high').map(renderRequirementItem)}</div>
                </section>
                <section>
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[.2em] mb-4">Complementarios</h2>
                    <div className="space-y-3">{requirements.filter(r => r.priority !== 'high').map(renderRequirementItem)}</div>
                </section>
            </main>

            {showPhotoStudio && (
                <PhotoStudio 
                    onCapture={handlePhotoCapture} 
                    onClose={() => setShowPhotoStudio(false)} 
                />
            )}
        </div>

    );
};

export default DocumentList;
