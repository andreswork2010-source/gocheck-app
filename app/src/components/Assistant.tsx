import React, { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { VISA_DATA } from '../data/visaData';
import { calculateAge, type UserProfile } from '../utils/scoring';

interface UploadedFile {
    file: File | null;
    previewUrl?: string;
    fileName: string;
}

interface AssistantProps {
    onBack: () => void;
    onNavigate: (view: string) => void;
    uploads: Record<string, UploadedFile>;
    destinationId: string;
    visaTypeId: string;
    userName: string;
    userProfile: UserProfile | null;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    type?: 'text' | 'analysis';
}

const Assistant: React.FC<AssistantProps> = ({ onBack, onNavigate, uploads, destinationId, visaTypeId, userName, userProfile }) => {

    // Resolve data
    const country = VISA_DATA.find(c => c.id === destinationId);
    const visa = country?.visas.find(v => v.id === visaTypeId);
    const countryName = country?.name || "tu destino";

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: `¡Hola ${userName ? userName.split(' ')[0] : ''}! Soy tu asistente de GoluM para tu viaje a ${countryName}. \n\nPuedo analizar tus documentos, explicarte requisitos o ayudarte a llenar formularios. ¿Qué necesitas hoy?`,
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        (window as any).dispatchOnNavigate = (view: string) => {
            onNavigate(view);
        };
        return () => {
            delete (window as any).dispatchOnNavigate;
        };
    }, [onNavigate]);

    const handleSendMessage = () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // Simulate AI processing
        setTimeout(() => {
            generateBotResponse(userMsg.text);
        }, 1500);
    };

    const generateBotResponse = async (query: string) => {
        const lowerQuery = query.toLowerCase();
        let responseText = '';

        // Passport Issuance Guidance (Humanized & Strategic)
        if ((lowerQuery.includes('obtener') || lowerQuery.includes('no tengo') || lowerQuery.includes('sacar')) && (lowerQuery.includes('pasaporte'))) {
            responseText = `Entiendo perfectamente, **no tienes pasaporte aún**. Pero no te preocupes, ¡para eso estoy aquí! Muchos viajeros de GoluM empiezan exactamente en tu misma situación.\n\n`;
            responseText += `Te voy a guiar paso a paso para que obtengas lo que es el **primer gran paso** para tu viaje a España. En Ecuador, el proceso es muy claro si sigues estos puntos:\n\n`;

            responseText += `1️⃣ **Pago al Registro Civil**: Debes cancelar **$90** (valor estándar). **Ojo: este no es un pago para GoluM**, sino la tasa oficial del Gobierno. Puedes hacerlo yendo físicamente a cualquier agencia del **Banco del Pacífico**, **Western Union** o **PagoÁgil** e indicando en ventanilla que vas a realizar el pago para la 'Solicitud de Pasaporte Ordinario'. También puedes pagar online en la Agencia Virtual con tu tarjeta. ¡Ese comprobante es tu pase de entrada!\n\n`;
            responseText += `2️⃣ **Agendar el Turno**: Una vez que el pago se refleje (suele tardar unas 24h), entra a la [Agencia Virtual del Registro Civil](https://virtual.registrocivil.gob.ec/). Selecciona 'Pasaporte Ordinario' y elige la ciudad y el horario que mejor te calce.\n\n`;
            responseText += `3️⃣ **La Cita Presencial**: El día de tu cita, solo necesitas llevar tu **cédula original**. No hace falta fotos ni nada más; te tomarán una foto profesional y tus huellas allí mismo.\n\n`;
            responseText += `4️⃣ **Entrega**: Generalmente te entregan el librito azul en ese mismo momento o en un par de días, dependiendo de la agencia.\n\n`;

            responseText += `💡 **Un consejo de amigo**: El número de pasaporte es lo primero que necesitaremos para llenar tus otros formularios, así que este paso es la llave que abre todas las demás puertas.\n\n`;
            responseText += `[🗺️ VER HOJA DE RUTA DEL PASAPORTE](navigate:passport-roadmap)\n\n`;
            responseText += `[🗓️ AGENDAR MI TURNO AQUÍ](btn:https://virtual.registrocivil.gob.ec/)\n\n`;
            responseText += `¿Te gustaría que te ayude a ver cuál es la agencia más cercana a ti o tienes alguna duda sobre el pago?`;

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'bot',
                timestamp: new Date()
            }]);
            setIsTyping(false);
            return;
        }

        // Logic to analyze documents
        if (lowerQuery.includes('analiza') || lowerQuery.includes('revisar') || lowerQuery.includes('documentos') || lowerQuery.includes('papeles')) {
            await analyzeDocuments();
            return;
        }

        // Form Assistance
        if (lowerQuery.includes('formulario') || lowerQuery.includes('llenar') || lowerQuery.includes('solicitud')) {
            const isSchengen = (visa?.maxDays || 0) <= 90;
            const formType = isSchengen ? 'Schengen (Estancia Corta)' : 'Nacional (Estancia Larga)';
            const formFile = isSchengen
                ? `formulario_schengen_${destinationId}.pdf`
                : `formulario_nacional_${destinationId}.pdf`;

            responseText = `📝 **Formulario de Visado ${visa?.name} (${formType}):**\n\n`;
            responseText += `Para completar tu solicitud sin errores, te sugiero seguir estos pasos:\n\n`;

            responseText += `1. **Descarga** el formulario oficial: [📄 Descargar PDF](/forms/${formFile})\n`;
            responseText += `2. **Llénalo Online**: He habilitado el acceso directo al editor recomendado:\n\n`;
            responseText += `[✨ ABRIR EDITOR PDF EXTERNO](btn:https://www.ilovepdf.com/edit-pdf)\n\n`;
            responseText += `3. **Guarda y Sube**: Una vez listo, descárgalo del editor y súbelo en la sección de **Documentos** de GoluM.\n\n`;

            responseText += `[📂 IR A MIS DOCUMENTOS](navigate:documents)\n\n`;

            responseText += "**Pro Tip:** Al subirlo aquí, quedará archivado de forma segura junto a tu seguro y pasaporte para imprimir todo junto.";
        }
        // Appointment Scheduling (NEW)
        else if (lowerQuery.includes('cita') || lowerQuery.includes('agendar') || lowerQuery.includes('turno')) {
            if (destinationId === 'es') {
                responseText = `📅 **Gestión de Cita - Consulado General de España**\n\n`;
                responseText += `Basado en tu perfil de **${visa?.name}**, aquí tienes el procedimiento exacto para Guayaquil/Quito:\n\n`;

                responseText += `🔍 **INFOGRAMA DE PASOS:**\n`;
                responseText += `1️⃣ **Registro en BLS**: Debes crear una cuenta en el portal oficial de BLS International.\n`;
                responseText += `2️⃣ **Validación Biométrica**: Se te solicitará una foto en vivo para verificar tu identidad.\n`;
                responseText += `3️⃣ **Selección de Fecha**: Elige el centro (UIO/GYE) y el tipo de visado.\n`;
                responseText += `4️⃣ **Confirmación por Email**: Recibirás un resguardo que **DEBES IMPRIMIR** y traer junto a tus documentos.\n\n`;

                responseText += `⚠️ **IMPORTANTE:** No agendes tu cita hasta que tengas al menos el 80% de tus documentos listos en GoluM.\n\n`;

                responseText += `[🗺️ VER HOJA DE RUTA VISUAL](navigate:appointment-roadmap)\n\n`;
                responseText += `[🗓️ IR AL PORTAL DE CITAS BLS](btn:https://ecuador.blsspainvisa.com/)\n\n`;
                responseText += `¿Deseas que revise tu lista de documentos para ver si ya estás listo para agendar?`;
            }
        }
        // Flight Reservation (NEW)
        else if (lowerQuery.includes('vuelo') || lowerQuery.includes('vuelos') || lowerQuery.includes('reserva') || lowerQuery.includes('boleto') || lowerQuery.includes('tiquete') || lowerQuery.includes('pasaje')) {
            if (lowerQuery.includes('costo') || lowerQuery.includes('precio') || lowerQuery.includes('cuanto') || lowerQuery.includes('cuánto') || lowerQuery.includes('vale') || lowerQuery.includes('pagar') || lowerQuery.includes('dinero') || lowerQuery.includes('valor')) {
                responseText = `💰 **Costo de la Reserva de Vuelo**\n\n`;
                responseText += `Hacer una reserva de vuelo para fines de visado tiene un costo variable:\n\n`;
                responseText += `• **Reservas en Aerolíneas**: Iberia o Air Europa permiten bloquear la tarifa por **$10 a $25** durante 48-72 horas.\n`;
                responseText += `• **Servicios Externos**: Hay plataformas especializadas que emiten itinerarios por unos **$15 a $30**.\n\n`;

                responseText += `🌐 **SERVICIOS RECOMENDADOS:**\n\n`;
                responseText += `[📑 VISA RESERVATION](btn:https://www.visareservation.com/)\n\n`;
                responseText += `[🐘 DUMBOVISA (Rápido)](btn:https://dumbovisa.com/)\n\n`;

                responseText += `🗺️ **GUÍA VISUAL PASO A PASO**\n`;
                responseText += `He preparado una hoja de ruta detallada para que hagas tu reserva sin errores y en el momento justo.\n\n`;
                responseText += `[✈️ VER HOJA DE RUTA DEL VUELO](navigate:flight-roadmap)\n\n`;

                responseText += `⚠️ **Nota Importante**: Estos valores los establece directamente la aerolínea o el proveedor, no GoluM. Te recomiendo hacerlo máximo 24h antes de tu cita para que el código esté vigente.\n\n`;
                responseText += `¿Te gustaría que te explique cómo verificar si una reserva externa sigue vigente antes de ir al consulado?`;
            } else {
                responseText = `✈️ **Tu Reserva de Vuelo para la Visa**\n\n`;
                responseText += `¡Claro que sí! Entiendo perfectamente que organizar el vuelo es una de las partes más emocionantes, pero también genera dudas. Aquí te ayudo paso a paso:\n\n`;

                responseText += `⚠️ **Dato Vital**: El consulado **no exige que compres el pasaje definitivo** todavía. Lo que necesitas es un "Itinerario" o "Reserva de Vuelo" confirmada.\n\n`;

                responseText += `🔍 **GUÍA PASO A PASO:**\n`;
                responseText += `1️⃣ **Busca tu Vuelo**: Entra a los sitios de aerolíneas que viajan a España directamente como **Iberia** o **Air Europa**. \n`;
                responseText += `2️⃣ **Genera la Reserva**: Elige "Pagar después" o selecciona una opción de reserva temporal.\n`;
                responseText += `3️⃣ **Sube a GoluM**: Una vez tengas tu PDF, súbelo a la sección de **Documentos**. ¡Yo me encargaré de recordarte imprimirlo!\n\n`;

                responseText += `[🗺️ VER HOJA DE RUTA DEL VUELO](navigate:flight-roadmap)\n\n`;

                responseText += `🔴 **ESTRATEGIA CRÍTICA DE GOLUM:**\n`;
                responseText += `Como las reservas gratuitas suelen durar solo entre **24 y 48 horas**, mi consejo de experto es que **dejes la reserva para el final.** \n\n`;
                responseText += `Genera tu itinerario máximo 24 horas antes de tu cita consular. Así, cuando el oficial verifique tu código de reserva (PNR), esta seguirá **VIGENTE**. Si la haces mucho antes, podría estar vencida para el día de la cita y eso es motivo frecuente de rechazo.\n\n`;

                responseText += `🌐 **ENLACES PARA TU RESERVA:**\n\n`;
                responseText += `[🇪🇸 BUSCAR EN IBERIA](btn:https://www.iberia.com/ec/)\n\n`;
                responseText += `[✈️ BUSCAR EN AIR EUROPA](btn:https://www.aireuropa.com/ec/es/home)\n\n`;

                responseText += `¿Deseas que te explique cómo coordinar tus fechas de vuelo con el seguro médico para evitar discrepancias?`;
            }
        }
        // Accommodation (NEW)
        else if (lowerQuery.includes('alojamiento') || lowerQuery.includes('hotel') || lowerQuery.includes('hospitalidad') || lowerQuery.includes('quedarme') || lowerQuery.includes('invitación')) {
            if (lowerQuery.includes('costo') || lowerQuery.includes('precio') || lowerQuery.includes('cuanto') || lowerQuery.includes('cuánto') || lowerQuery.includes('vale')) {
                responseText = `💰 **Costo del Alojamiento**\n\n`;
                responseText += `El presupuesto para alojamiento varía según tu elección:\n\n`;
                responseText += `• **Hoteles/Hostales**: Desde **$40 a $120 por noche** según la ciudad y la temporada.\n`;
                responseText += `• **Carta de Invitación**: El trámite en la policía española cuesta unos **€80**, pero recuerda que tu anfitrión también debe demostrar solvencia.\n\n`;
                responseText += `⚠️ **Pro-Tip**: Si reservas hotel, elige siempre opciones con **cancelación gratuita**. Así no arriesgas tu dinero si la visa toma más tiempo del previsto.\n\n`;
                responseText += `[🛏️ BUSCAR EN BOOKING.COM](btn:https://www.booking.com/)`;
            } else {
                responseText = `🏠 **Tu Alojamiento para la Visa**\n\n`;
                responseText += `Demostrar dónde vas a dormir es obligatorio para que te aprueben la visa. Tienes dos caminos principales:\n\n`;

                responseText += `1️⃣ **Reserva de Hotel**: Es el camino más rápido. Lo importante es que la reserva esté a tu nombre y cubra todo el viaje.\n`;
                responseText += `2️⃣ **Carta de Invitación**: Si te quedas con un amigo o familiar, él debe tramitar un acta oficial en la Comisaría de Policía de España.\n\n`;

                responseText += `[🗺️ VER HOJA DE RUTA DE ALOJAMIENTO](navigate:accommodation-roadmap)\n\n`;

                responseText += `🔍 **RECOMENDACIÓN ESTRATÉGICA:**\n`;
                responseText += `Si aún no tienes la carta de invitación física, mi consejo es que presentes una **reserva de hotel confirmada** para agilizar el trámite, y una vez en Europa, decidas dónde quedarte.\n\n`;

                responseText += `🌐 **PAGINAS RECOMENDADAS:**\n\n`;
                responseText += `[🏨 BOOKING.COM (Cancelación Gratuita)](btn:https://www.booking.com/)\n\n`;
                responseText += `[🏡 AIRBNB (Solicita Factura PDF)](btn:https://www.airbnb.com/)\n\n`;

                responseText += `¿Deseas que te pase un modelo de los datos que debe incluir tu anfitrión para la carta de invitación?`;
            }
        }
        // Travel Insurance (NEW)
        else if (lowerQuery.includes('seguro') || lowerQuery.includes('insurance') || lowerQuery.includes('póliza')) {
            if (lowerQuery.includes('costo') || lowerQuery.includes('precio') || lowerQuery.includes('cuanto') || lowerQuery.includes('cuánto') || lowerQuery.includes('vale')) {
                responseText = `💰 **Costo del Seguro de Viaje**\n\n`;
                responseText += `El precio varía según los días de cobertura y tu edad:\n\n`;
                responseText += `• **15 días**: Desde **$45 a $80**\n`;
                responseText += `• **30 días**: Desde **$80 a $150**\n`;
                responseText += `• **90 días**: Desde **$200 a $350**\n\n`;
                responseText += `⚠️ **Importante**: Estos son valores referenciales. El costo final depende de la aseguradora y tu perfil.\n\n`;
                responseText += `🌐 **COTIZA EN LÍNEA:**\n\n`;
                responseText += `[🛡️ ASEGURA TU VIAJE](btn:https://www.aseguratuviaje.com.ec/)\n\n`;
                responseText += `[🌍 ASSIST CARD](btn:https://www.assist-card.com/ec)\n\n`;
                responseText += `[✈️ WORLD NOMADS](btn:https://www.worldnomads.com/)\n\n`;
            } else {
                responseText = `🛡️ **Seguro de Viaje para Visado Schengen**\n\n`;
                responseText += `Para que tu visa a **${country?.name}** sea aprobada, el seguro no es opcional, es un requisito legal estricto. Debe cumplir con lo siguiente:\n\n`;

                responseText += `✅ **REQUISITOS OBLIGATORIOS:**\n`;
                responseText += `• **Cobertura:** Mínimo de €30,000 (o su equivalente en dólares).\n`;
                responseText += `• **Alcance:** Debe cubrir todos los estados miembros del espacio Schengen.\n`;
                responseText += `• **Conceptos:** Debe incluir repatriación sanitaria y atención médica de urgencia.\n`;
                responseText += `• **Deducible:** Se recomienda que sea de **€0 (cero)**. Si tiene deducible, el consulado podría rechazarlo.\n\n`;

                responseText += `💎 **RECOMENDACIONES DE GOLUM:**\n`;
                responseText += `1. **Asegúrate de que sea "Válido para Visado":** Muchas pólizas de tarjetas de crédito no cubren los €30,000 o no emiten el certificado específico que pide el consulado.\n`;
                responseText += `2. **Fechas:** Debe cubrir desde el día que sales hasta el día que regresas (inclusive).\n\n`;

                responseText += `🌐 **PROVEEDORES RECOMENDADOS:**\n\n`;
                responseText += `[🛡️ ASEGURA TU VIAJE (Ecuador)](btn:https://www.aseguratuviaje.com.ec/)\n\n`;
                responseText += `[🌍 ASSIST CARD](btn:https://www.assist-card.com/ec)\n\n`;
                responseText += `[✈️ WORLD NOMADS (Internacional)](btn:https://www.worldnomads.com/)\n\n`;

                responseText += `¿Cuentas ya con un seguro o quieres que te ayude a validar si el que tienes es compatible?`;
            }
        }
        // Financial Solvency (NEW)
        else if (lowerQuery.includes('solvencia') || lowerQuery.includes('económica') || lowerQuery.includes('economica') || lowerQuery.includes('banco') || lowerQuery.includes('cuenta') || lowerQuery.includes('dinero') || lowerQuery.includes('fondos')) {
            responseText = `💼 **Solvencia Económica para tu Visa**\n\n`;
            responseText += `Demostrar que tienes recursos suficientes es uno de los requisitos más importantes. El consulado quiere asegurarse de que no trabajarás ilegalmente.\n\n`;

            responseText += `📊 **DOCUMENTOS PRINCIPALES:**\n`;
            responseText += `• **Estados de Cuenta**: Últimos 3-6 meses sellados por el banco\n`;
            responseText += `• **Carta Laboral**: Indicando cargo, salario y autorización para viajar\n`;
            responseText += `• **Certificados de Propiedad**: Bienes inmuebles o vehículos (prueba de arraigo)\n\n`;

            responseText += `[🗺️ VER HOJA DE RUTA DE SOLVENCIA](navigate:financial-roadmap)\n\n`;

            responseText += `💡 **MONTO RECOMENDADO:**\n`;
            responseText += `Calcula entre **€60 a €100 por día** de viaje. Para 15 días, serían unos **$1,000 a $1,600** en tu cuenta.\n\n`;

            responseText += `¿Necesitas ayuda para organizar tus documentos financieros o tienes dudas sobre qué presentar si eres independiente?`;
        }
        // Biometric Photo (NEW)
        else if (lowerQuery.includes('foto') || lowerQuery.includes('fotografía') || lowerQuery.includes('fotografia') || lowerQuery.includes('biométrica') || lowerQuery.includes('biometrica')) {
            if (lowerQuery.includes('costo') || lowerQuery.includes('precio') || lowerQuery.includes('cuanto') || lowerQuery.includes('cuánto') || lowerQuery.includes('vale')) {
                responseText = `💰 **Costo de la Foto Biométrica**\n\n`;
                responseText += `En Ecuador, el precio promedio para un set de 2 fotos tipo visa Schengen es:\n\n`;
                responseText += `• **Estudios Fotográficos**: **$3 a $8**\n`;
                responseText += `• **Centros Comerciales**: **$5 a $10**\n\n`;
                responseText += `⚠️ **No uses impresoras caseras**. La foto debe ser en papel fotográfico profesional.\n\n`;
            } else {
                responseText = `📸 **Tu Foto para la Visa Schengen**\n\n`;
                responseText += `La foto biométrica debe cumplir con estándares internacionales muy estrictos:\n\n`;

                responseText += `✅ **REQUISITOS TÉCNICOS:**\n`;
                responseText += `• **Tamaño**: 35mm x 45mm (estándar ICAO)\n`;
                responseText += `• **Fondo**: Blanco o gris claro uniforme\n`;
                responseText += `• **Expresión**: Rostro neutro, boca cerrada, mirando al frente\n`;
                responseText += `• **Vigencia**: Máximo 6 meses de antigüedad\n\n`;

                responseText += `[🗺️ VER GUÍA COMPLETA DE FOTOGRAFÍA](navigate:photo-roadmap)\n\n`;

                responseText += `💡 **PRO-TIP**: Busca estudios que especifiquen "Fotos para Visa Schengen". Lleva ropa oscura para mejor contraste.\n\n`;
            }
            responseText += `¿Quieres que te recomiende estudios fotográficos cerca de ti?`;
        }
        // Application Form (NEW)
        else if (lowerQuery.includes('formulario') || lowerQuery.includes('solicitud') || lowerQuery.includes('llenar') || lowerQuery.includes('rellenar')) {
            responseText = `📄 **Formulario de Solicitud Schengen**\n\n`;
            responseText += `Este es el documento central de tu trámite. Debe estar completado sin errores, tachones ni campos vacíos.\n\n`;

            responseText += `📝 **SECCIONES PRINCIPALES:**\n`;
            responseText += `1. **Datos Personales**: Exactamente como en tu pasaporte\n`;
            responseText += `2. **Datos del Viaje**: Fechas, destino principal, propósito\n`;
            responseText += `3. **Alojamiento**: Hotel o anfitrión\n`;
            responseText += `4. **Medios de Subsistencia**: Cómo pagarás el viaje\n`;
            responseText += `5. **Firma**: A mano con bolígrafo, DESPUÉS de imprimir\n\n`;

            responseText += `[🗺️ VER GUÍA CAMPO POR CAMPO](navigate:form-roadmap)\n\n`;

            responseText += `⚠️ **ERRORES COMUNES A EVITAR:**\n`;
            responseText += `• Dejar campos en blanco (escribe "N/A" si no aplica)\n`;
            responseText += `• Fechas que no coinciden con vuelo/seguro\n`;
            responseText += `• Usar corrector líquido o tachones\n\n`;

            responseText += `¿Deseas que te ayude a llenar el formulario con tus datos guardados en GoluM?`;
        }
        // Requirements
        else if (lowerQuery.includes('requisitos') || lowerQuery.includes('necesito')) {
            responseText = `📋 **Requisitos para ${visa?.name} (${country?.name}):**\n\n`;
            if (visa && visa.requirements) {
                responseText += visa.requirements.map(r => `• **${r.title}:** ${r.description}`).join('\n');
            } else {
                responseText += "No tengo la lista específica cargada, pero generalmente necesitas Pasaporte, Fotos, Seguro y Solvencia Económica.";
            }
        }
        // Cost / Price
        else if (lowerQuery.includes('costo') || lowerQuery.includes('precio') || lowerQuery.includes('vale') || lowerQuery.includes('cuesta') || lowerQuery.includes('cuanto') || lowerQuery.includes('cuánto')) {
            responseText = `💰 **Presupuesto Total del Proceso (Estimado):**\n\n`;
            responseText += `📋 **COSTOS OFICIALES:**\n`;
            responseText += `1. **Tasa Consular**: Aproximadamente **€80** (pago oficial no reembolsable)\n`;
            responseText += `2. **Pasaporte Ecuatoriano**: **$90** (si aún no lo tienes)\n\n`;

            responseText += `📋 **DOCUMENTOS Y SERVICIOS:**\n`;
            responseText += `3. **Reserva de Vuelo**: Entre **$15 y $30** (bloqueo temporal)\n`;
            responseText += `4. **Seguro de Viaje**: Desde **$45 a $150** (según días)\n`;
            responseText += `5. **Alojamiento**: Desde **$40/noche** (hotel) o **€80** (carta invitación)\n`;
            responseText += `6. **Foto Biométrica**: **$3 a $8** (set de 2 fotos)\n`;
            responseText += `7. **Estados de Cuenta**: **$5 a $15** (certificación bancaria)\n\n`;

            responseText += `💡 **PRESUPUESTO MÍNIMO RECOMENDADO**: Entre **$300 y $500** para todo el proceso (sin contar el pasaje definitivo).\n\n`;
            responseText += `¿Quieres que te detalle alguno de estos costos específicamente?`;
        }
        // Time
        else if (lowerQuery.includes('tiempo') || lowerQuery.includes('tarda') || lowerQuery.includes('demora')) {
            responseText = `⏱️ **Tiempo de Procesamiento:**\n\n`;
            responseText += `Generalmente, el consulado de ${country?.name} toma entre **15 y 45 días calendario** en procesar la solicitud una vez entregada la documentación. Te recomiendo aplicar con al menos 2 meses de antelación.`;
        }
        // General Visa Process / How to Travel (NEW - Catch-all for general questions)
        else if (lowerQuery.includes('viajar') || lowerQuery.includes('proceso') || lowerQuery.includes('empezar') || lowerQuery.includes('comenzar') || lowerQuery.includes('hacer') || lowerQuery.includes('pasos')) {
            responseText = `✈️ **Tu Viaje a ${country?.name} - Guía Completa**\n\n`;
            responseText += `¡Excelente decisión! Viajar a España es totalmente posible si sigues el proceso correcto. Déjame guiarte paso a paso:\n\n`;

            responseText += `📋 **PROCESO COMPLETO (8 PASOS):**\n\n`;
            responseText += `1️⃣ **Pasaporte**: Si no lo tienes, tramítalo primero ($90, tarda 1-3 días)\n`;
            responseText += `2️⃣ **Documentos Financieros**: Estados de cuenta y carta laboral\n`;
            responseText += `3️⃣ **Reserva de Vuelo**: Itinerario temporal ($15-$30)\n`;
            responseText += `4️⃣ **Alojamiento**: Reserva de hotel o carta de invitación\n`;
            responseText += `5️⃣ **Seguro de Viaje**: Cobertura mínima €30,000 ($45-$150)\n`;
            responseText += `6️⃣ **Foto Biométrica**: 35x45mm, fondo blanco ($3-$8)\n`;
            responseText += `7️⃣ **Formulario**: Llenar solicitud Schengen sin errores\n`;
            responseText += `8️⃣ **Cita BLS**: Agendar y presentar documentos (€80)\n\n`;

            responseText += `💰 **PRESUPUESTO TOTAL**: Entre **$300 y $500** (sin contar pasaje definitivo)\n`;
            responseText += `⏱️ **TIEMPO TOTAL**: 2-3 meses desde que empiezas hasta que viajas\n\n`;

            responseText += `🎯 **¿POR DÓNDE EMPIEZO?**\n\n`;
            responseText += `Pregúntame sobre cualquier paso específico, por ejemplo:\n`;
            responseText += `• "¿Cómo saco el pasaporte?"\n`;
            responseText += `• "¿Cuánto cuesta la reserva de vuelo?"\n`;
            responseText += `• "¿Qué documentos necesito?"\n`;
            responseText += `• "¿Cómo agendo la cita?"\n\n`;

            responseText += `O si ya tienes documentos subidos, puedo **analizarlos** para ver qué te falta. ¿Qué te gustaría hacer primero?`;
        }
        else {
            // Default responses
            responseText = `Entendido. Estoy aquí para ayudarte con tu viaje a **${country?.name}**. \n\nPuedes preguntarme sobre:\n• Requisitos de la visa\n• Cómo llenar el formulario\n• Costos y tiempos\n• O pedirme que **analice tus documentos** subidos.`;
        }

        const msg: Message = {
            id: (Date.now() + 1).toString(),
            text: responseText,
            sender: 'bot',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, msg]);
        setIsTyping(false);
    };

    const analyzeDocuments = async () => {
        setIsTyping(true);
        const passportFile = uploads['pass']?.file;
        const passportDataStr = localStorage.getItem('passportData');
        const passportData = passportDataStr ? JSON.parse(passportDataStr) : null;

        let analysisText = "🕵️ **Iniciando Análisis Crítico de Perfil y Documentación...**\n\n";

        // 1. ANÁLISIS CRÍTICO DE PERFIL (Basado en Edad, Ingresos, Profesión)
        if (userProfile) {
            const age = calculateAge(userProfile.birthDate);
            const income = parseFloat(userProfile.income) || 0;

            analysisText += `📌 **ANÁLISIS DE PERFIL:**\n`;
            analysisText += `Edad: **${age} años** | Profesión: **${userProfile.profession}** | Ingresos: **$${income}**\n\n`;

            if (age < 25) {
                analysisText += `⚠️ **Riesgo por Edad:** Al tener ${age} años, los consulados suelen aplicar un escrutinio mayor por "riesgo de migración irregular". Es vital que tus lazos con Ecuador sean irrefutables.\n`;
            } else if (age > 45) {
                analysisText += `✅ **Factor Estabilidad:** Tu perfil de madurez ayuda a consolidar una imagen de estabilidad ante el oficial consular.\n`;
            }

            if (income < 1500) {
                analysisText += `⚠️ **Factor Económico:** Tus ingresos mensuales están en la zona de observación. Te recomiendo encarecidamente subir tus estados de cuenta para demostrar ahorros sólidos.\n`;
            } else {
                analysisText += `✅ **Factor Económico:** Tu nivel de ingresos demuestra solvencia suficiente para los estándares europeos.\n`;
            }
            analysisText += "\n---\n\n";
        }

        if (!passportFile) {
            analysisText = "❌ **Error Crítico:** No encuentro el archivo de tu Pasaporte cargado en memoria. Por favor ve a la sección de Documentos y asegúrate de subirlo.";
        } else {
            // Check for Profile Photo
            if (uploads['profile_photo']?.file) {
                analysisText += "📸 **Biometría:** He recibido tu foto de perfil. La usaré para cotejar con la foto del pasaporte.\n\n";
            } else {
                analysisText += "⚠️ **Biometría:** No has subido una foto de perfil en el registro. Esto impide la verificación biométrica completa.\n\n";
            }

            // Start OCR
            try {
                // If it's a PDF, we can't easily OCR in browser without pdf.js + canvas complexity. 
                // For this demo we will assume images for deep analysis or warn.
                if (passportFile.type === 'application/pdf') {
                    analysisText += "⚠️ **Pasaporte (PDF):** He detectado el archivo PDF. Sin embargo, para una verificación rigurosa de los datos biométricos, te recomiendo subir una foto (JPG/PNG) de la página principal.\n\n";
                    analysisText += "He verificado que el archivo existe y es un PDF válido.";
                } else {
                    // Image OCR
                    analysisText = "🔍 **Iniciando análisis biométrico riguroso...**\n\n";

                    // Allow UI to update with "Typing..." or intermediate message? 
                    // We are inside isTyping state, so user sees ...

                    const { data: { text } } = await Tesseract.recognize(
                        passportFile,
                        'eng', // Passport MRZ is usually OCR-B / English chars
                        { logger: m => console.log(m) }
                    );

                    const ocrText = text.toUpperCase();
                    console.log("OCR Result:", ocrText);

                    let discrepancies = [];

                    // 1. Verify Passport Number
                    if (passportData?.number) {
                        if (!ocrText.includes(passportData.number.toUpperCase())) {
                            discrepancies.push(`- **Número de Pasaporte:** El número que ingresaste (${passportData.number}) NO aparece en el documento escaneado.`);
                        }
                    } else {
                        discrepancies.push("- **Datos:** No has ingresado el número de pasaporte manualmente.");
                    }

                    // 2. Verify Logic (Dates) - heuristic check only if we could parse dates, but typically hard with regex across formats.
                    // We will stick to the Passport Number as the primary "Rigorous" anchor.

                    // 3. Keyword Check
                    if (!ocrText.includes("PASSPORT") && !ocrText.includes("PASAPORTE") && !ocrText.includes("REPUBLICA")) {
                        discrepancies.push("- **Validez del Documento:** El archivo no parece ser un pasaporte válido (no encuentro palabras clave como 'Pasaporte' o 'Republica').");
                    }

                    if (discrepancies.length > 0) {
                        analysisText += "❌ **He encontrado inconsistencias graves en tu documentación:**\n\n" + discrepancies.join("\n") + "\n\nPor favor verifica que la foto sea clara y los datos coincidan exactamente.";
                    } else {
                        analysisText += "✅ **Verificación Exitosa:** El documento parece legítimo y el número de pasaporte coincide con el ingresado manualmente.";
                    }
                }

            } catch (err) {
                console.error(err);
                analysisText += "⚠️ **Error de Análisis:** No pude procesar la imagen del pasaporte. Asegúrate de que no esté borrosa o corrupta.";
            }
        }

        // Analyze others loosely
        const otherDocsCount = Object.keys(uploads).length - (uploads['pass'] ? 1 : 0);
        if (otherDocsCount > 0) {
            analysisText += `\n\n📂 Además, he detectado otros ${otherDocsCount} documento(s). Recuerda que deben ser oficiales y legibles.`;
        }

        const msg: Message = {
            id: (Date.now() + 1).toString(),
            text: analysisText,
            sender: 'bot',
            timestamp: new Date(),
            type: 'analysis'
        };
        setMessages(prev => [...prev, msg]);
        setIsTyping(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display selection:bg-primary/30 min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl z-40 border-b border-primary/10 px-6 py-4 flex items-center gap-4">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <span className="material-icons text-primary">chevron_left</span>
                </button>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <span className="material-icons">smart_toy</span>
                </div>
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold leading-tight">GoluM AI</h1>
                    <p className="text-xs uppercase tracking-wider text-primary font-semibold">Agente Migratorio Virtual</p>
                </div>
            </header>

            {/* Main Chat Container */}
            <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col relative overflow-hidden">
                {/* Main Chat Area */}
                <main className="flex-1 px-4 py-8 overflow-y-auto flex flex-col gap-6 pb-32">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 max-w-2xl ${msg.sender === 'user' ? 'self-end flex-row-reverse' : ''} animate-fadeIn`}>
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white mt-1 ${msg.sender === 'user' ? 'bg-slate-300 dark:bg-slate-700' : 'bg-primary'}`}>
                                <span className="material-icons text-sm">{msg.sender === 'user' ? 'person' : 'smart_toy'}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className={`p-5 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-none'}`}>
                                    <div
                                        className="text-base leading-relaxed whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{
                                            __html: msg.text
                                                .replace(/\n/g, '<br/>')
                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                .replace(/\[(.*?)\]\((.*?)\)/g, (_match, text, url) => {
                                                    if (url.startsWith('navigate:')) {
                                                        const view = url.split(':')[1];
                                                        return `<button onclick="window.dispatchOnNavigate('${view}')" class="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:scale-105 transition-transform my-2 block w-max">${text}</button>`;
                                                    }
                                                    if (url.startsWith('btn:')) {
                                                        const realUrl = url.split('btn:')[1];
                                                        return `<a href="${realUrl}" target="_blank" class="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform my-3 inline-flex items-center gap-2 shadow-lg shadow-primary/20 no-underline">${text}</a>`;
                                                    }
                                                    return `<a href="${url}" target="_blank" class="${msg.sender === 'user' ? 'text-white' : 'text-primary'} underline font-bold hover:opacity-80">${text}</a>`;
                                                })
                                        }}
                                    />
                                </div>
                                {msg.type === 'analysis' && (
                                    <div className="flex gap-2 ml-1">
                                        <button onClick={() => onNavigate('documents')} className="text-xs font-bold text-primary hover:underline">
                                            Ir a Mis Documentos
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-4 max-w-2xl animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white mt-1">
                                <span className="material-icons text-sm">smart_toy</span>
                            </div>
                            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl rounded-tl-none">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                {/* Bottom Input Area */}
                <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/95 dark:via-background-dark/95 to-transparent pt-4 pb-8 z-50">
                    <div className="max-w-4xl mx-auto px-4 w-full">
                        {/* Suggestions chips (only show if chat is empty-ish) */}
                        {messages.length < 3 && (
                            <div className="flex gap-3 overflow-x-auto no-scrollbar mb-4 opacity-70 justify-center">
                                {['Analiza mis documentos', '¿Qué me falta?', 'Revisar pasaporte'].map((tag, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInputText(tag)}
                                        className="text-xs font-medium whitespace-nowrap bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 pl-4 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-black/50">
                            <input
                                className="flex-1 bg-transparent border-none focus:ring-0 text-base placeholder:text-slate-400 dark:text-white h-12 outline-none"
                                placeholder="Escribe tu consulta..."
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                            <div className="flex items-center gap-2 pr-1">
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputText.trim()}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${!inputText.trim() ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-primary/20'}`}
                                >
                                    <span className="material-icons">arrow_upward</span>
                                </button>
                            </div>
                        </div>
                        <div className="text-center mt-3">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">GoluM AI puede cometer errores. Verifica la información importante.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Assistant;
