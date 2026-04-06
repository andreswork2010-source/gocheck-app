import { GoogleGenerativeAI } from "@google/generative-ai";

export const getGeminiResponse = async (prompt: string, context: any) => {
    const API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
    if (!API_KEY) return "⚠️ Falta API KEY en .env";

    // Intentamos con varios modelos por si uno no está disponible en este proyecto/región
    const MODELS = ["gemini-1.5-flash", "gemini-flash-latest", "gemini-2.0-flash"];
    let lastError = "";

    for (const modelName of MODELS) {
        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            
            const profile = context.userProfile || {};
            const systemBase = `Eres el Agente Migratorio experto de Go-Check (Ecuador). 
Tu misión es asesorar a ${context.userName || 'el usuario'} para su viaje a ${context.countryName || 'su destino'}.
PERFIL DEL USUARIO:
- Profesión: ${profile.profession || 'No especificada'}
- Ingresos: $${profile.income || '0'}
- Estado Civil: ${profile.civilStatus || 'No especificado'}
- Tipo de Visa: ${context.visaName || 'No especificada'}
- Documentos cargados: ${Object.keys(context.uploads || {}).join(', ') || 'Ninguno'}

REGLAS:
1. Responde de forma experta, cercana pero profesional.
2. Sé breve y directo.
3. Si el usuario pregunta por análisis de documentos, usa los datos de OCR que se te proporcionen.
4. FORMULARIOS: No rellenes formularios automáticamente. Si el usuario los pide, indícale que los puede descargar en formato PDF oficial de Go-Check y recomienda usar herramientas como iLovePDF para completarlos manualmente.
5. Siempre termina recordando que eres de Go-Check si es el inicio o fin de un tema.
6. MONETIZACIÓN: Si el usuario menciona vuelos, hoteles, seguros médicos o alquiler de autos, DEBES sugerirle comprar a través de nuestros aliados oficiales de Go-Check Driver. 
   Para hacerlo, usa EXACTAMENTE este formato de enlace: [TEXTO DEL BOTÓN](https://tp.media/r?marker=${import.meta.env.VITE_TRAVELPAYOUTS_MARKER || '703875'}&p=PROMO_ID&u=LINK_DESTINO)
   - PROMO_ID para Seguros (EKTA): 7041
   - PROMO_ID para Vuelos (Aviasales): 100
   - PROMO_ID para Hoteles (Hotellook): 121
7. Usa formato markdown ligero (negritas, listas).`;


            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: systemBase,
                generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
            });

            const history = Array.isArray(context.history) ? context.history : [];
            const chat = model.startChat({ history });

            const result = await chat.sendMessage(prompt);
            const response = await result.response;
            const text = response.text();
            
            if (text) return text;
        } catch (error: any) {
            lastError = error.message || "";
            console.warn(`Falló el modelo ${modelName}, intentando siguiente...`, lastError);
            
            // Si es un error de cuota agotada (429), no seguimos intentando otros modelos
            if (lastError.includes("429")) {
                return "🚫 **Cuota Diaria Agotada:** Has alcanzado el límite máximo gratuito de Google por hoy.";
            }

            // Si es error de API Key no válida, tampoco seguimos
            if (lastError.includes("API key not valid")) {
                return "🔑 **Error de API:** Tu API Key de Gemini parece no ser válida o está inactiva.";
            }
        }
    }

    // Si llegamos aquí es que fallaron todos los modelos
    if (lastError.includes("fetch") || lastError.includes("NetworkError")) {
        return "🌐 **Error de Conexión:** No pude conectar con Google. Verifica tu internet o si tienes algún bloqueador de anuncios (AdBlock) que pueda estar interfiriendo.";
    }

    return `⚠️ Error al conectar con la IA. (Detalle: ${lastError.substring(0, 40)}...)`;
}
