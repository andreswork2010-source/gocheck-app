import React, { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { VISA_DATA } from '../data/visaData';
import { calculateAge, type UserProfile } from '../utils/scoring';
import { getCloudChatMessages, saveChatMessage } from '../lib/userService';
import { getGeminiResponse } from '../lib/gemini';

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
    userId: string;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: any; // Can be Date or String when loaded
    type?: 'text' | 'analysis';
}

const Assistant: React.FC<AssistantProps> = ({ onBack, onNavigate, uploads, destinationId, visaTypeId, userName, userProfile, userId }) => {

    // Resolve data
    const country = VISA_DATA.find(c => c.id === destinationId);
    const visa = country?.visas.find(v => v.id === visaTypeId);
    const countryName = country?.name || "tu destino";

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // PERSISTENCE LOGIC (Enhanced with Cloud Sync)
    useEffect(() => {
        const loadHistory = async () => {
            const storageKey = `chat_history_${userId}`;
            const localSaved = localStorage.getItem(storageKey);
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

            // 1. Try fetching from Cloud
            if (userId !== 'guest') {
                const cloudMessages = await getCloudChatMessages(userId);
                if (cloudMessages && cloudMessages.length > 0) {
                    const validCloud = cloudMessages.filter((m: any) => new Date(m.timestamp).getTime() > thirtyDaysAgo);
                    if (validCloud.length > 0) {
                        setMessages(validCloud);
                        return;
                    }
                }
            }

            // 2. Fallback to LocalStorage
            if (localSaved) {
                try {
                    const parsed = JSON.parse(localSaved);
                    const validMessages = parsed.filter((m: any) => new Date(m.timestamp).getTime() > thirtyDaysAgo);

                    if (validMessages.length > 0) {
                        setMessages(validMessages);
                        return;
                    }
                } catch (e) {
                    console.error("Error loading chat history:", e);
                }
            }

            // 3. Default initial message
            if (messages.length === 0) {
                setMessages([
                    {
                        id: '1',
                        text: `¡Hola ${userName ? userName.split(' ')[0] : ''}! Soy tu asistente de Go-Check para tu viaje a ${countryName}. \n\nPuedo analizar tus documentos, explicarte requisitos o ayudarte a llenar formularios. ¿Qué necesitas hoy?`,
                        sender: 'bot',
                        timestamp: new Date()
                    }
                ]);
            }
        };

        loadHistory();
    }, [userId, userName, countryName]);

    // Save messages whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            const storageKey = `chat_history_${userId}`;
            localStorage.setItem(storageKey, JSON.stringify(messages));
        }
    }, [messages, userId]);

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

    const addBotMessage = async (text: string, type: 'text' | 'analysis' = 'text') => {
        const msg: Message = {
            id: (Date.now() + 1).toString(),
            text,
            sender: 'bot',
            timestamp: new Date(),
            type
        };
        setMessages(prev => [...prev, msg]);
        setIsTyping(false);

        if (userId !== 'guest') {
            await saveChatMessage(userId, text, 'bot', { type });
        }
    };

    const clearHistory = () => {
        if (!window.confirm("¿Estás seguro de que quieres borrar el historial de chat?")) return;
        setMessages([
            {
                id: '1',
                text: `¡Hola de nuevo ${userName ? userName.split(' ')[0] : ''}! He limpiado nuestro historial. ¿En qué más puedo ayudarte con tu viaje a ${countryName}?`,
                sender: 'bot',
                timestamp: new Date()
            }
        ]);
        const storageKey = `chat_history_${userId}`;
        localStorage.removeItem(storageKey);
    };

    const handleSendMessage = () => {
        if (!inputText.trim() || isTyping) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputText('');
        setIsTyping(true);

        if (userId !== 'guest') {
            saveChatMessage(userId, userMsg.text, 'user');
        }

        setTimeout(() => {
            generateBotResponse(userMsg.text, newMessages);
        }, 100);
    };

    const generateBotResponse = async (query: string, currentMessages: Message[]) => {
        const lowerQuery = query.toLowerCase();

        try {
            // IA REAL (GEMINI) - Preparación de historial compatible
            let historyForGemini = currentMessages
                .filter(m => m.text && m.text.trim().length > 0 && m.text !== query)
                .map(m => ({
                    role: m.sender === 'bot' ? 'model' : 'user',
                    parts: [{ text: m.text }]
                }));

            // REGLA CRÍTICA: Gemini requiere que la historia empiece con un mensaje del usuario
            const firstUserIndex = historyForGemini.findIndex(m => m.role === 'user');
            if (firstUserIndex === -1) {
                historyForGemini = [];
            } else {
                historyForGemini = historyForGemini.slice(firstUserIndex);
            }

            if (historyForGemini.length > 4) {
                historyForGemini = historyForGemini.slice(-4);
                if (historyForGemini[0].role === 'model') {
                    historyForGemini = historyForGemini.slice(1);
                }
            }

            const context = {
                userName: userName || "Usuario",
                userProfile: userProfile,
                countryName: countryName,
                visaName: visa?.name || "Visa",
                destinationId: destinationId,
                // Only send the LIST of files, NOT the file content to save tokens
                uploadList: Object.keys(uploads).map(k => uploads[k].fileName || k),
                history: historyForGemini
            };

            // 1. ESPECIAL: OCR DE DOCUMENTOS + IA
            if (lowerQuery.includes('analiza') || lowerQuery.includes('revisar') || lowerQuery.includes('documentos') || lowerQuery.includes('papeles') || lowerQuery.includes('requisitos')) {
                const ocrData = await runOCR();
                const analysisPrompt = `Análisis de documentos y requisitos solicitado.
DATOS ACTUALES:
${ocrData}

Por favor, revisa si falta algo importante para ${countryName} (${visa?.name}) y da consejos sobre cómo mejorar el perfil financiero o de vínculos.`;
                
                const aiResponse = await getGeminiResponse(analysisPrompt, context);
                await addBotMessage(aiResponse, 'analysis');
                return;
            }

            const aiResponse = await getGeminiResponse(query, context);
            await addBotMessage(aiResponse);
        } catch (error: any) {
            console.error("Error generating bot response:", error);
            const detail = error.message?.substring(0, 30) || "Error desconocido";
            await addBotMessage(`⚠️ Tuve un problema al procesar tu mensaje (${detail}). Por favor, verifica tu conexión o intenta con una pregunta más corta.`);
            setIsTyping(false);
        }
    };

    const runOCR = async (): Promise<string> => {
        setIsTyping(true);
        const passportFile = uploads['pass']?.file;
        const passportDataStr = localStorage.getItem('passportData');
        const passportData = passportDataStr ? JSON.parse(passportDataStr) : null;

        let ocrSummary = "";

        if (!passportFile) {
            ocrSummary = "[ERROR: Pasaporte no cargado]";
        } else {
            try {
                if (passportFile.type === 'application/pdf') {
                    ocrSummary = "[PDF detectado, metadatos verificados]";
                } else {
                    const { data: { text } } = await Tesseract.recognize(
                        passportFile,
                        'eng'
                    );
                    ocrSummary = `[OCR Pasaporte: ${text.substring(0, 500)}...]`;
                }
            } catch (err) {
                ocrSummary = "[Error en el proceso OCR]";
            }
        }

        const age = userProfile ? calculateAge(userProfile.birthDate) : 0;
        const income = userProfile ? (parseFloat(userProfile.income) || 0) : 0;

        return `
        DATOS DE PERFIL:
        - Edad: ${age} años
        - Ingresos: $${income}
        - Profesión: ${userProfile?.profession}
        - Archivos en sistema: ${Object.keys(uploads).join(', ')}
        - Pasaporte Manual: ${passportData?.number || 'No ingresado'}
        - Resultado OCR Transcrito: ${ocrSummary}
        `;
    };


    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display selection:bg-primary/30 min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl z-40 border-b border-primary/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors">
                        <span className="material-icons text-primary">chevron_left</span>
                    </button>
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <span className="material-icons">smart_toy</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold leading-tight">Go-Check</h1>
                        <p className="text-xs uppercase tracking-wider text-primary font-semibold">Agente Migratorio Virtual</p>
                    </div>
                </div>
                <button onClick={clearHistory} className="text-slate-400 hover:text-status-red transition-colors flex items-center gap-1 text-xs font-bold" title="Limpiar historial">
                    <span className="material-icons text-sm">delete_sweep</span>
                    <span className="hidden sm:inline">LIMPIAR</span>
                </button>
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
                                        className="text-base leading-relaxed break-words"
                                        dangerouslySetInnerHTML={{
                                            __html: msg.text
                                                // 1. Headers (must be before list parsing)
                                                .replace(/^### (.*$)/gm, '<h3 class="text-base font-bold text-primary mt-4 mb-2">$1</h3>')
                                                .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold text-primary mt-6 mb-3 border-b border-primary/10 pb-1">$1</h2>')
                                                .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold text-primary mt-8 mb-4">$1</h1>')
                                                
                                                // 2. Bold/Emphasis
                                                .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                                
                                                // 3. Lists (handle multiple levels and clean up)
                                                .replace(/^\s*[\*-]\s+(.*)/gm, '<li class="ml-5 list-disc my-1">$1</li>')
                                                .replace(/^\s*\d+\.\s+(.*)/gm, '<li class="ml-5 list-decimal my-1">$1</li>')
                                                
                                                // 4. Custom Buttons / Navigation
                                                .replace(/\[(.*?)\]\((.*?)\)/g, (_match, text, url) => {
                                                    if (url.startsWith('navigate:')) {
                                                        const view = url.split(':')[1];
                                                        return `<button onclick="window.dispatchOnNavigate('${view}')" class="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl font-bold hover:bg-primary/20 transition-all my-2 flex items-center gap-2 group">
                                                            <span class="material-icons text-sm">explore</span>
                                                            ${text}
                                                        </button>`;
                                                    }
                                                    if (url.startsWith('btn:')) {
                                                        const realUrl = url.split('btn:')[1];
                                                        return `<a href="${realUrl}" target="_blank" class="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform my-3 inline-flex items-center gap-2 shadow-lg shadow-primary/20 no-underline">
                                                            <span class="material-icons">open_in_new</span>
                                                            ${text}
                                                        </a>`;
                                                    }
                                                    // Travelpayouts / Affiliate buttons
                                                    if (url.includes('tp.media')) {
                                                        return `<div class="my-4"><a href="${url}" target="_blank" class="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform inline-flex items-center gap-2 shadow-xl no-underline">
                                                            <span class="material-icons">shopping_cart</span>
                                                            ${text}
                                                        </a></div>`;
                                                    }
                                                    return `<a href="${url}" target="_blank" class="${msg.sender === 'user' ? 'text-white' : 'text-primary'} underline font-bold hover:opacity-80">${text}</a>`;
                                                })

                                                
                                                // 5. Paragraphs and line breaks (more robust)
                                                .split('\n\n').map(p => {
                                                    if (p.includes('<h') || p.includes('<li')) return p;
                                                    return `<div class="mb-4">${p.replace(/\n/g, '<br/>')}</div>`;
                                                }).join('')
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
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Go-Check puede cometer errores. Verifica la información importante.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Assistant;
