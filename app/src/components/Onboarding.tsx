import React, { useState, useEffect } from 'react';
import { VISA_DATA } from '../data/visaData';

interface OnboardingProps {
    onNext: (data: any) => void;
    initialData?: any;
    onCancel?: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onNext, initialData, onCancel }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        birthDate: initialData?.birthDate || '',
        birthPlace: initialData?.birthPlace || '',
        civilStatus: initialData?.civilStatus || '',
        profession: initialData?.profession || '',
        income: initialData?.income || '',
        destination: initialData?.destination || 'es',
        image: '',
        visaType: initialData?.visaType || 'tourist',
        days: initialData?.days || 15,
        travelDate: '',
        photo: null as File | null,
        photoPreview: initialData?.photoUrl || '',
        phone: initialData?.phone || '',
        email: initialData?.email || '',
        companions: initialData?.companions || [] as {id: string, name: string, relation: string, age: string}[]
    });

    const [showCompanionForm, setShowCompanionForm] = useState(false);
    const [newCompanion, setNewCompanion] = useState({ name: '', relation: 'Pareja', age: '' });

    // Camera Support
    const [showCamera, setShowCamera] = useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [cameraError, setCameraError] = useState('');

    const [availableVisas, setAvailableVisas] = useState(VISA_DATA.find(c => c.id === 'es')?.visas || []);

    // Update available visas when destination changes
    useEffect(() => {
        const country = VISA_DATA.find(c => c.id === formData.destination);
        if (country) {
            setAvailableVisas(country.visas);
            // Reset visa type if current one is not valid for new country
            if (!country.visas.find(v => v.id === formData.visaType)) {
                setFormData(prev => ({ ...prev, visaType: country.visas[0]?.id || '' }));
            }
        }
    }, [formData.destination, formData.visaType]);

    const [isSaving, setIsSaving] = useState(false);

    const handleNext = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (step < 4) {
            setStep(step + 1);
            window.scrollTo(0, 0);
        } else {
            setIsSaving(true);
            try {
                await onNext(formData);
            } catch (err) {
                console.error("Onboarding completion error:", err);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const selectedCountryName = VISA_DATA.find(c => c.id === formData.destination)?.name;
    const selectedVisaName = availableVisas.find(v => v.id === formData.visaType)?.name;

    // Camera Logic
    useEffect(() => {
        let stream: MediaStream | null = null;
        if (showCamera) {
            (async () => {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                    setCameraError('');
                } catch (err: any) {
                    console.error("Camera error:", err);
                    if (err.name === 'NotAllowedError') {
                        setCameraError('Permiso denegado. Por favor, permite el acceso a la cámara en tu navegador.');
                    } else if (err.name === 'NotFoundError') {
                        setCameraError('No se encontró ninguna cámara conectada a este dispositivo.');
                    } else {
                        setCameraError('Error al acceder a la cámara. Intenta subir un archivo en su lugar.');
                    }
                }
            })();
        } else {
            // Stop stream
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
            }
        }
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [showCamera]);

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');

                // Also create a File object for the 'photo' property if needed for other logic
                canvas.toBlob(blob => {
                    if (blob) {
                        const file = new File([blob], "profile_capture.jpg", { type: "image/jpeg" });
                        setFormData({
                            ...formData,
                            photo: file,
                            photoPreview: dataUrl
                        });
                        setShowCamera(false);
                    }
                }, 'image/jpeg');
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display p-6 relative">

            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden max-w-md w-full relative">
                        <div className="p-4 bg-primary text-white flex justify-between items-center">
                            <h3 className="font-bold">Tomar Foto</h3>
                            <button onClick={() => setShowCamera(false)} className="text-white hover:bg-white/20 rounded-full p-1">
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <div className="relative bg-black aspect-[4/3] flex items-center justify-center overflow-hidden">
                            {cameraError ? (
                                <p className="text-white p-4 text-center">{cameraError}</p>
                            ) : (
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
                            )}
                        </div>
                        <div className="p-6 flex justify-center gap-4 bg-white dark:bg-slate-800">
                            <button
                                onClick={capturePhoto}
                                type="button"
                                className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center bg-white hover:bg-slate-100 transition-colors shadow-lg"
                            >
                                <div className="w-12 h-12 bg-primary rounded-full"></div>
                            </button>
                        </div>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            )}

            {/* Header Navigation */}
            <header className="fixed top-0 left-0 w-full p-6 flex items-center justify-between z-50 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-white font-bold text-xl italic">G</span>
                    </div>
                    <span className="font-bold text-lg tracking-tight">Go-Check</span>
                </div>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="pointer-events-auto flex items-center gap-1 text-slate-500 hover:text-primary transition-colors font-bold text-sm"
                    >
                        <span className="material-icons text-base">close</span>
                        <span>Cancelar</span>
                    </button>
                )}
            </header>

            {/* Main Card Container */}
            <main className="w-full max-w-2xl bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">

                {/* Progress Bar (Top) */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800">
                    <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }}></div>
                </div>

                <div className="p-8 md:p-12">
                    {/* Step Header */}
                    <div className="mb-8 text-center">
                        <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                            Paso {step} de 4
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900 dark:text-white transition-all">
                            {step === 1 && "Datos Personales"}
                            {step === 2 && "Grupo Familiar"}
                            {step === 3 && "Configura tu Viaje"}
                            {step === 4 && "Verificación Final"}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                            {step === 1 && "Para comenzar, necesitamos conocer quién eres para personalizar tu perfil."}
                            {step === 2 && "¿Viajas acompañado? Registra a tu esposo/a o hijos para gestionar los documentos de todos desde un solo lugar."}
                            {step === 3 && "Selecciona tu destino, duración y el tipo de visado que te interesa solicitar."}
                            {step === 4 && "Revisa que toda la información sea correcta antes de generar tu lista de requisitos."}
                        </p>
                    </div>

                    {/* Form Fields */}
                    <form className="space-y-6 max-w-md mx-auto" onSubmit={handleNext}>
                        {step === 1 && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Profile Photo Upload */}
                                <div className="flex flex-col items-center justify-center mb-8">
                                    <div className="relative group mb-6">
                                        <div
                                            className={`w-32 h-32 rounded-3xl border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center transition-all ${formData.photo ? 'bg-black' : 'bg-slate-100 dark:bg-slate-800'}`}
                                        >
                                            {formData.photoPreview ? (
                                                <img src={formData.photoPreview} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <span className="material-icons text-4xl text-slate-300 dark:text-slate-600 block mb-1">face</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin Foto</span>
                                                </div>
                                            )}
                                        </div>
                                        {formData.photoPreview && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, photo: null, photoPreview: '' })}
                                                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
                                            >
                                                <span className="material-icons text-sm">close</span>
                                            </button>
                                        )}
                                    </div>

                                    {!formData.photoPreview ? (
                                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                                            {/* Take Photo Option */}
                                            <button
                                                type="button"
                                                onClick={() => setShowCamera(true)}
                                                className="flex flex-col items-center justify-center p-4 bg-primary/5 hover:bg-primary/10 border-2 border-dashed border-primary/30 rounded-2xl transition-all group"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                    <span className="material-icons">photo_camera</span>
                                                </div>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Tomar Foto</span>
                                                <span className="text-[9px] text-slate-500 mt-1">Usa tu webcam</span>
                                            </button>

                                            {/* Upload File Option */}
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById('profile-photo-input')?.click()}
                                                className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl transition-all group"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                    <span className="material-icons">upload</span>
                                                </div>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Subir Archivo</span>
                                                <span className="text-[9px] text-slate-500 mt-1">PC o Teléfono</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-status-green font-bold flex items-center gap-1">
                                            <span className="material-icons text-sm">check_circle</span> Foto cargada correctamente
                                        </p>
                                    )}

                                    <input
                                        type="file"
                                        id="profile-photo-input"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData({
                                                        ...formData,
                                                        photo: file,
                                                        photoPreview: reader.result as string
                                                    });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </div>

                                {/* First Name & Last Name */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Nombre</label>
                                        <div className="relative">
                                            <input
                                                className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                                placeholder="Ej: Juan"
                                                required
                                                type="text"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            />
                                            <span className="material-icons absolute right-4 top-3 text-slate-400 pointer-events-none">person</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Apellido</label>
                                        <div className="relative">
                                            <input
                                                className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                                placeholder="Ej: Pérez"
                                                required
                                                type="text"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Fecha de Nacimiento</label>
                                        <div className="relative">
                                            <input
                                                className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                                                required
                                                type="date"
                                                value={formData.birthDate}
                                                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Estado Civil</label>
                                        <div className="relative">
                                            <select
                                                className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all appearance-none text-slate-900 dark:text-white"
                                                required
                                                value={formData.civilStatus}
                                                onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value })}
                                            >
                                                <option value="">Seleccionar...</option>
                                                <option value="soltero">Soltero/a</option>
                                                <option value="casado">Casado/a</option>
                                                <option value="divorciado">Divorciado/a</option>
                                                <option value="union">Unión de Hecho</option>
                                            </select>
                                            <span className="material-icons absolute right-4 top-3 text-slate-400 pointer-events-none">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Lugar de Nacimiento</label>
                                    <div className="relative">
                                        <input
                                            className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                            placeholder="Ciudad, País"
                                            required
                                            type="text"
                                            value={formData.birthPlace}
                                            onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                                        />
                                        <span className="material-icons absolute right-4 top-3 text-slate-400 pointer-events-none">location_on</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Profesión / Ocupación</label>
                                    <div className="relative">
                                        <input
                                            className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                            placeholder="Ej: Ingeniero de Software"
                                            required
                                            type="text"
                                            value={formData.profession}
                                            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                                        />
                                        <span className="material-icons absolute right-4 top-3 text-slate-400 pointer-events-none">work</span>
                                    </div>
                                </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Teléfono de contacto</label>
                                        <div className="relative">
                                            <input
                                                className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                                placeholder="Ej: +57 300 123 4567"
                                                required
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                            <span className="material-icons absolute right-4 top-3 text-slate-400 pointer-events-none">phone</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Correo Electrónico</label>
                                        <div className="relative">
                                            <input
                                                className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                                placeholder="tu@email.com"
                                                required
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                            <span className="material-icons absolute right-4 top-3 text-slate-400 pointer-events-none">email</span>
                                        </div>
                                    </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <h3 className="font-bold mb-2">Compañeros de Viaje</h3>
                                    <p className="text-sm text-slate-500 mb-6">Si viajas en familia, no necesitas crear varias cuentas. Añádelos aquí.</p>
                                    
                                    {formData.companions.length > 0 && (
                                        <div className="space-y-3 mb-6">
                                            {formData.companions.map((comp: any) => (
                                                <div key={comp.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                                   <div>
                                                       <p className="font-bold text-sm text-slate-900 dark:text-white">{comp.name}</p>
                                                       <p className="text-xs text-slate-500">{comp.relation} • {comp.age} años</p>
                                                   </div>
                                                   <button type="button" onClick={() => setFormData(p => ({...p, companions: p.companions.filter((c: any) => c.id !== comp.id)}))} className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors">
                                                       <span className="material-icons text-sm">delete</span>
                                                   </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {showCompanionForm ? (
                                        <div className="space-y-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-primary/30 shadow-md">
                                            <div>
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Nombre Completo</label>
                                                <input type="text" placeholder="Ej: Maria Pérez" className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 focus:ring-2 focus:ring-primary outline-none" value={newCompanion.name} onChange={e => setNewCompanion({...newCompanion, name: e.target.value})} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Relación</label>
                                                    <select value={newCompanion.relation} onChange={e => setNewCompanion({...newCompanion, relation: e.target.value})} className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 focus:ring-2 focus:ring-primary outline-none appearance-none">
                                                        <option value="Pareja">Pareja</option>
                                                        <option value="Hijo/a">Hijo/a</option>
                                                        <option value="Familiar">Familiar</option>
                                                        <option value="Amigo/a">Amigo/a</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Edad</label>
                                                    <input type="number" placeholder="Ej: 8" className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 focus:ring-2 focus:ring-primary outline-none" value={newCompanion.age} onChange={e => setNewCompanion({...newCompanion, age: e.target.value})} />
                                                </div>
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button type="button" onClick={() => {
                                                    if(newCompanion.name && newCompanion.age) {
                                                        setFormData(p => ({...p, companions: [...p.companions, { ...newCompanion, id: Date.now().toString() }]}));
                                                        setNewCompanion({ name: '', relation: 'Pareja', age: '' });
                                                        setShowCompanionForm(false);
                                                    }
                                                }} className="flex-1 bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-colors">Guardar</button>
                                                <button type="button" onClick={() => setShowCompanionForm(false)} className="px-4 text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300">Cancelar</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => setShowCompanionForm(true)} className="w-full py-4 border-2 border-dashed border-primary/40 rounded-xl text-primary font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                                            <span className="material-icons">person_add</span> Añadir Acompañante
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-5 animate-fadeIn">
                                {/* Destination Country */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">País de Destino</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all appearance-none text-slate-900 dark:text-white"
                                            required
                                            value={formData.destination}
                                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                        >
                                            {VISA_DATA.map(country => (
                                                <option key={country.id} value={country.id}>
                                                    {country.flag} {country.name}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="material-icons absolute right-4 top-3 text-slate-400 pointer-events-none">public</span>
                                    </div>
                                </div>

                                {/* Visa Type */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Tipo de Visado</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all appearance-none text-slate-900 dark:text-white"
                                            required
                                            value={formData.visaType}
                                            onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                                        >
                                            {availableVisas.map(visa => (
                                                <option key={visa.id} value={visa.id}>
                                                    {visa.name} (Máx {visa.maxDays} días)
                                                </option>
                                            ))}
                                        </select>
                                        <span className="material-icons absolute right-4 top-3 text-slate-400 pointer-events-none">card_travel</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 px-1">
                                        {availableVisas.find(v => v.id === formData.visaType)?.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Days of Stay */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Días de Estadía</label>
                                        <div className="relative">
                                            <input
                                                className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-slate-900 dark:text-white center-text"
                                                required
                                                type="number"
                                                min="1"
                                                max="365"
                                                value={formData.days}
                                                onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })}
                                            />
                                            <span className="absolute right-4 top-3 text-sm font-bold text-slate-400">Días</span>
                                        </div>
                                    </div>

                                    {/* Income */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Ingresos / Mes</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3 text-slate-500 font-bold">$</span>
                                            <input
                                                className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-slate-900 dark:text-white font-medium"
                                                placeholder="0.00"
                                                required
                                                type="number"
                                                value={formData.income}
                                                onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-100/50 dark:bg-slate-800">
                                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Resumen de Datos</h3>
                                        <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-primary hover:underline">Editar</button>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <p className="text-xs text-slate-500 uppercase tracking-wider">Solicitante</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">{formData.firstName} {formData.lastName}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase tracking-wider">Destino</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">{selectedCountryName}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase tracking-wider">Duración</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">{formData.days} días</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase tracking-wider">Teléfono</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">{formData.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase tracking-wider">Email</p>
                                                <p className="font-semibold text-slate-900 dark:text-white truncate">{formData.email}</p>
                                            </div>
                                            <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Grupo de Viaje</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {formData.companions.length > 0 ? (
                                                        <span>Titular + {formData.companions.length} acompañante(s)</span>
                                                    ) : 'Viaja sin acompañantes'}
                                                </p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs text-slate-500 uppercase tracking-wider">Tipo de Visa</p>
                                                <p className="font-semibold text-primary">{selectedVisaName}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                    <span className="material-icons text-primary">playlist_add_check</span>
                                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        Al finalizar, generaremos automáticamente la lista de <strong>requisitos indispensables</strong> para tu visa de <strong>{selectedVisaName}</strong> hacia {selectedCountryName}.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="pt-8 flex gap-4">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors"
                                >
                                    Atrás
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`flex-[2] h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSaving ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                <span>{step === 4 ? "Generar Requisitos" : "Continuar"}</span>
                                        <span className="material-icons text-lg">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-40"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] opacity-40"></div>
            </div>
        </div>
    );
};

export default Onboarding;
