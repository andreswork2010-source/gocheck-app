import React, { useState, useEffect } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { type UserProfile } from '../utils/scoring';

interface VisaFormProps {
    onBack: () => void;
    destinationName: string;
    prefillData?: any;
    userProfile: UserProfile | null;
    onSave?: (pdfDataUrl: string) => void;
}

const VisaForm: React.FC<VisaFormProps> = ({ onBack, destinationName, userProfile, onSave }) => {
    const [formData, setFormData] = useState({
        surname: '',
        firstName: '',
        dateOfBirth: '',
        placeOfBirth: '',
        countryOfBirth: 'Ecuador',
        nationality: 'Ecuatoriana',
        sex: 'M',
        civilStatus: '',
        passportNumber: '',
        passportIssueDate: '',
        passportExpiryDate: '',
        email: '',
        phone: '',
        homeAddress: '',
        occupation: '',
        employer: '',
        mainDestination: destinationName,
        entryState: destinationName,
        purpose: 'Turismo',
        entryDate: '',
        exitDate: '',
        hotelName: '',
        hotelAddress: '',
        hotelEmail: '',
        hotelPhone: '',
        invitingPerson: '',
        entriesRequested: 'multiple',
        stayDuration: '15'
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // 1. Prefill from userProfile (Onboarding data)
        if (userProfile) {
            setFormData(prev => ({
                ...prev,
                firstName: userProfile.firstName || '',
                surname: userProfile.lastName || '',
                dateOfBirth: userProfile.birthDate || '',
                placeOfBirth: userProfile.birthPlace || '',
                civilStatus: userProfile.civilStatus || '',
                occupation: userProfile.profession || '',
                entryDate: '', // Can try to get from somewhere else if needed
                stayDuration: String(userProfile.days || 15)
            }));
        }

        // 2. Prefill from localStorage (Passport, Flights)
        const passportDataStr = localStorage.getItem('passportData');
        if (passportDataStr) {
            try {
                const passData = JSON.parse(passportDataStr);
                setFormData(prev => ({
                    ...prev,
                    passportNumber: passData.number || prev.passportNumber,
                    surname: passData.lastName || prev.surname,
                    firstName: passData.firstName || prev.firstName,
                    dateOfBirth: passData.birthDate || prev.dateOfBirth,
                    nationality: passData.nationality || prev.nationality
                }));
            } catch (e) { console.error(e); }
        }

        const flightDataStr = localStorage.getItem('flightData');
        if (flightDataStr) {
            try {
                const flightData = JSON.parse(flightDataStr);
                setFormData(prev => ({
                    ...prev,
                    entryDate: flightData.arrivalDate || prev.entryDate,
                    mainDestination: destinationName
                }));
            } catch (e) { console.error(e); }
        }
    }, [userProfile, destinationName]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Fetch the existing PDF template
            const response = await fetch('/forms/formulario_schengen_es.pdf');
            if (!response.ok) throw new Error('No se pudo cargar la plantilla PDF');
            const arrayBuffer = await response.arrayBuffer();

            // 2. Load the PDF document
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const pages = pdfDoc.getPages();

            // Standard Schengen Form has 4 pages. We target the first page for main data.
            const firstPage = pages[0];
            const secondPage = pages[1];
            // const { width, height } = firstPage.getSize(); // 595 x 841 approx (A4)

            // Define coordinates (X, Y from bottom-left) for the Spanish official form
            // These are calibrated for the standard "formulario_schengen_es.pdf"
            const textColor = rgb(0, 0, 0.4); // Dark blue for high contrast

            const draw = (page: any, text: string, x: number, y: number, size: number = 10) => {
                if (!text || !page) return;
                page.drawText(String(text).toUpperCase(), {
                    x,
                    y,
                    size,
                    font: helveticaFont,
                    color: textColor,
                });
            };

            // RE-CALIBRATED MAPPING
            // PAGE 1
            draw(firstPage, formData.surname, 42, 698);            // 1. Apellidos
            draw(firstPage, formData.firstName, 42, 638);          // 3. Nombre
            draw(firstPage, formData.dateOfBirth, 42, 608);        // 4. Fecha nac
            draw(firstPage, formData.placeOfBirth, 42, 578);       // 5. Lugar nac
            draw(firstPage, formData.countryOfBirth, 142, 578);    // 6. País nac
            draw(firstPage, formData.nationality, 42, 548);        // 7. Nacionalidad

            if (formData.sex === 'M') draw(firstPage, 'X', 42, 518); // 8. Sexo Masculino (check)
            if (formData.sex === 'F') draw(firstPage, 'X', 82, 518); // 8. Sexo Femenino (check)

            // Estado Civil (Checks)
            if (formData.civilStatus === 'soltero') draw(firstPage, 'X', 142, 518);
            if (formData.civilStatus === 'casado') draw(firstPage, 'X', 202, 518);

            draw(firstPage, formData.passportNumber, 42, 414);     // 13. Número documento
            draw(firstPage, formData.passportIssueDate, 42, 384);  // 14. Fecha expedición
            draw(firstPage, formData.passportExpiryDate, 142, 384); // 15. Fecha validez
            draw(firstPage, formData.homeAddress, 42, 321, 8);     // 17. Domicilio
            draw(firstPage, formData.email, 42, 301, 8);           // 17. Email
            draw(firstPage, formData.phone, 182, 301, 8);          // 17. Teléfono
            draw(firstPage, formData.occupation, 42, 221);         // 19. Profesión
            draw(firstPage, formData.employer, 42, 191, 8);        // 20. Empresa/Escuela

            // PAGE 2 Mapping
            draw(secondPage, formData.mainDestination, 42, 721);   // 22. Destino principal
            draw(secondPage, formData.entryState, 182, 721);       // 23. Estado de entrada
            draw(secondPage, formData.stayDuration, 242, 661);     // 25. Duración
            draw(secondPage, formData.entryDate, 42, 561);         // 29. Fecha llegada
            draw(secondPage, formData.exitDate, 182, 561);        // 30. Fecha salida

            // 31. Alojamiento
            const hotelText = formData.hotelName || formData.invitingPerson;
            draw(secondPage, hotelText, 42, 501, 8);
            draw(secondPage, formData.hotelAddress, 42, 461, 7);
            draw(secondPage, formData.hotelEmail, 42, 431, 7);
            draw(secondPage, formData.hotelPhone, 182, 431, 7);

            const pdfBytes = await pdfDoc.save();

            // Convertir a Data URL (Base64) para persistencia total
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

            // Convert to Base64 for persistence
            const base64String = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });

            if (onSave) {
                onSave(base64String);
            }

            // AUTO-DOWNLOAD for immediate verification
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'formulario_schengen_completado.pdf';
            link.click();

            alert('¡Éxito! Tu formulario se ha descargado y guardado en tu sección de Documentos.');
        } catch (error) {
            console.error('Error saving PDF:', error);
            alert('Error crítico al generar el PDF. Verifica tu conexión e intenta de nuevo.');
            // Fallback: save current data URL of the page? No, just trigger onSave with null or something
            if (onSave) onSave('');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex flex-col font-display">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between no-print">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors">
                        <span className="material-icons text-slate-600 dark:text-slate-300">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Solicitud de Visado Schengen</h1>
                        <p className="text-xs text-slate-500">Borrador Digital • {destinationName}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 font-medium border border-slate-200 dark:border-slate-600"
                    >
                        <span className="material-icons text-sm">print</span>
                        <span className="hidden sm:inline">Vista Previa</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/90 font-medium shadow-lg shadow-primary/20 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span className="material-icons text-sm">{isSaving ? 'sync' : 'save'}</span>
                        <span className="hidden sm:inline">{isSaving ? 'Procesando...' : 'Guardar en Documentos'}</span>
                    </button>
                </div>
            </header>

            {/* Form Container */}
            <main className="flex-1 max-w-4xl mx-auto w-full p-6 print:p-0 print:max-w-none">
                <div className="bg-white dark:bg-slate-800 dark:print:bg-white rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 print:border-none print:shadow-none">

                    {/* Official-looking Header for Print */}
                    <div className="hidden print:flex justify-between items-start mb-8 border-b-2 border-black pb-4">
                        <div>
                            <h2 className="text-2xl font-bold uppercase">Solicitud de Visado Schengen</h2>
                            <p className="text-sm">Formulario gratuito</p>
                        </div>
                        <div className="w-32 h-40 border border-slate-300 flex items-center justify-center bg-slate-50 text-slate-400 text-xs text-center p-2">
                            FOTO
                        </div>
                    </div>

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4 print:text-black">

                        {/* Section 1: Personal Data */}
                        <div className="col-span-1 md:col-span-2 text-primary font-bold uppercase text-sm tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2 mb-2 mt-2 flex justify-between">
                            <span>1. Datos Personales</span>
                            <span className="text-[10px] text-slate-400 normal-case font-normal mt-1">Llenado automático parcial</span>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Apellido(s)</label>
                            <input
                                name="surname" value={formData.surname} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none print:bg-transparent print:border-b print:border-t-0 print:border-x-0 print:rounded-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Nombre(s)</label>
                            <input
                                name="firstName" value={formData.firstName} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none print:bg-transparent print:border-b print:border-t-0 print:border-x-0 print:rounded-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Fecha de Nacimiento</label>
                            <input
                                type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none print:bg-transparent print:border-b print:border-t-0 print:border-x-0 print:rounded-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Lugar de Nacimiento</label>
                            <input
                                name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none print:bg-transparent print:border-b print:border-t-0 print:border-x-0 print:rounded-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Profesión Actual</label>
                            <input
                                name="occupation" value={formData.occupation} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none print:bg-transparent print:border-b print:border-t-0 print:border-x-0 print:rounded-none font-bold text-primary"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Nacionalidad Actual</label>
                            <input
                                name="nationality" value={formData.nationality} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none print:bg-transparent print:border-b print:border-t-0 print:border-x-0 print:rounded-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Estado Civil</label>
                            <select
                                name="civilStatus" value={formData.civilStatus} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none print:appearance-none print:bg-transparent print:border-b print:border-t-0 print:border-x-0 print:rounded-none"
                            >
                                <option value="">Seleccionar</option>
                                <option value="soltero">Soltero/a</option>
                                <option value="casado">Casado/a</option>
                                <option value="divorciado">Divorciado/a</option>
                                <option value="viudo">Viudo/a</option>
                                <option value="union">Unión de hecho</option>
                            </select>
                        </div>

                        {/* Section 2: Passport Info */}
                        <div className="col-span-1 md:col-span-2 text-primary font-bold uppercase text-sm tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2 mb-2 mt-4">
                            2. Documento de Viaje
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Número de Pasaporte</label>
                            <input
                                name="passportNumber" value={formData.passportNumber} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none print:bg-transparent print:border-b print:border-t-0 print:border-x-0 print:rounded-none font-mono"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">País de Expedición</label>
                            <input
                                name="countryOfBirth" value={formData.countryOfBirth} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none print:bg-transparent print:border-b print:border-t-0 print:border-x-0 print:rounded-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Fecha de Expedición</label>
                            <input
                                type="date" name="passportIssueDate" value={formData.passportIssueDate} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none print:bg-transparent print:border-b print:border-t-0 print:border-x-0 print:rounded-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Fecha de Caducidad</label>
                            <input
                                type="date" name="passportExpiryDate" value={formData.passportExpiryDate} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none print:bg-transparent print:border-b print:border-t-0 print:border-x-0 print:rounded-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Teléfono de contacto</label>
                            <input
                                name="phone" value={formData.phone} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none print:bg-transparent print:border-b print:border-t-0 print:border-x-0 print:rounded-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Correo Electrónico</label>
                            <input
                                name="email" value={formData.email} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none print:bg-transparent print:border-b print:border-t-0 print:border-x-0 print:rounded-none"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Dirección de Domicilio Completa</label>
                            <input
                                name="homeAddress" value={formData.homeAddress} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>

                        {/* Section 3: Travel Data */}
                        <div className="col-span-1 md:col-span-2 text-primary font-bold uppercase text-sm tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2 mb-2 mt-4 flex justify-between">
                            <span>3. Datos del Viaje</span>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Destino Principal</label>
                            <input
                                name="mainDestination" value={formData.mainDestination} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Motivo del viaje</label>
                            <select
                                name="purpose" value={formData.purpose} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                            >
                                <option value="Turismo">Turismo</option>
                                <option value="Negocios">Negocios</option>
                                <option value="Visita Familiar">Visita a Familiares</option>
                                <option value="Estudios">Estudios</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Número de Entradas</label>
                            <select
                                name="entriesRequested" value={formData.entriesRequested} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                            >
                                <option value="single">Una entrada</option>
                                <option value="two">Dos entradas</option>
                                <option value="multiple">Múltiples entradas</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Duración prevista (días)</label>
                            <input
                                name="stayDuration" value={formData.stayDuration} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>

                        {/* Section 4: Hosting */}
                        <div className="col-span-1 md:col-span-2 text-primary font-bold uppercase text-sm tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2 mb-2 mt-4">
                            4. Alojamiento / Invitación
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Nombre del Hotel o Persona que invita</label>
                            <input
                                name="hotelName" value={formData.hotelName} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Dirección y código postal</label>
                            <input
                                name="hotelAddress" value={formData.hotelAddress} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Teléfono</label>
                            <input
                                name="hotelPhone" value={formData.hotelPhone} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                            <input
                                name="hotelEmail" value={formData.hotelEmail} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2 mt-6 p-4 bg-slate-50 dark:bg-slate-700/20 rounded-lg border border-slate-100 dark:border-slate-700 text-xs text-slate-500 text-justify print:bg-transparent print:border-none print:p-0">
                            * Declaro que a mi leal entender y saber, todos los datos que preceden son correctos y completos. Soy consciente de que cualquier declaración falsa dará lugar a la denegación de mi visado.
                        </div>

                        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-8 mt-4 print:mt-12">
                            <div className="border-t border-slate-300 pt-2">
                                <p className="text-xs uppercase font-bold text-slate-400">Lugar y Fecha</p>
                            </div>
                            <div className="border-t border-slate-300 pt-2">
                                <p className="text-xs uppercase font-bold text-slate-400">Firma del Solicitante</p>
                            </div>
                        </div>

                    </form>
                </div>
            </main>
        </div>
    );
};

export default VisaForm;
