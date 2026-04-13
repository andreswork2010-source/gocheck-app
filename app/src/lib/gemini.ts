export const getGeminiResponse = async (prompt: string, context: any) => {
    let lastError = "";

    try {
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

        // Adaptamos el historial
        const rawHistory = Array.isArray(context.history) ? context.history : [];
        const messages: Array<{role: "system"|"user"|"assistant", content: string}> = [
            { role: "system", content: systemBase }
        ];

        for (const msg of rawHistory) {
            const role = msg.role === 'model' ? 'assistant' : 'user';
            const content = Array.isArray(msg.parts) ? msg.parts[0]?.text || "" : "";
            if (content) {
                messages.push({ role, content });
            }
        }

        messages.push({ role: "user", content: prompt });

        // En lugar de llamar a Groq directamente, solicitamos mediante el PUENTE (Backend)
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || response.statusText);
        }

        const data = await response.json();
        
        if (data.text) return data.text;
    } catch (error: any) {
        lastError = error.message || "";
        console.warn(`Falló la conexión al Puente (API Route):`, lastError);
    }

    if (lastError.includes("fetch") || lastError.includes("NetworkError") || lastError.includes("connection")) {
        return "🌐 **Error de Conexión:** No pude conectar con la IA. Verifica tu internet o si tienes algún bloqueador de anuncios.";
    }

    return `⚠️ Error al interactuar con el puente de la IA. (Detalle: ${lastError.substring(0, 40)}...)`;
}
