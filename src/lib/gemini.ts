export const getGeminiResponse = async (prompt: string, context: any) => {

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
7. Usa formato markdown ligero (negritas, listas).
8. PASAPORTE ECUATORIANO: Si preguntan cómo sacar o renovar el pasaporte, DEBES dar esta info exacta:
   - **Costo:** $90 (Primera vez/Renovación), $45 (Tercera Edad), $0 (30%+ discapacidad).
   - **Trámite:** Generar turno y pagar en la Agencia Virtual del Registro Civil: [Agencia Virtual](https://virtual.registrocivil.gob.ec).
   - **Pasos:** 1. Registrarse en la web 2. Seleccionar servicio 3. Pagar (tarjeta en línea o efectivo en agencias bancarias afiliadas) 4. Agendar cita en agencia 5. Ir el día elegido con tu cédula.`;

    const history = Array.isArray(context.history) ? context.history : [];
    
    // Convert gemini history format to standard OpenAI/Groq format
    const messages = [];
    messages.push({ role: 'system', content: systemBase });
    
    // Add past messages
    for (const msg of history) {
        messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.parts[0].text
        });
    }

    // Add current prompt
    messages.push({ role: 'user', content: prompt });

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages }),
        });

        if (!response.ok) {
           let errorDetail = "";
           try {
               const errData = await response.json();
               errorDetail = errData.error || response.statusText;
           } catch (e) {
               errorDetail = response.statusText;
           }
           if (response.status === 429) {
               return "🚫 **Límite Alcanzado:** Demasiadas solicitudes al mismo tiempo. Por favor intenta en un minuto.";
           }
           throw new Error(`Error ${response.status}: ${errorDetail}`);
        }

        const data = await response.json();
        return data.result || "No pude generar una respuesta.";

    } catch (error: any) {
        console.error("Error al conectar con la IA de Vercel/Groq:", error);
        if (error.message.includes("fetch") || error.message.includes("NetworkError")) {
            return "🌐 **Error de Conexión:** No pude contactar al servidor. Verifica tu internet o revisa que '/api/chat' esté desplegado correctamente.";
        }
        return `⚠️ Error al conectar con la IA. (Detalle: ${error.message})`;
    }
}
