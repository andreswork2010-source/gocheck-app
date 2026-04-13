import Groq from "groq-sdk";

export default async function handler(req, res) {
  // Solo permitimos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Inicializamos Groq desde el Backend. 
    // Al estar en la nube, "process.env" lee directamente la llave secreta.
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    // Obtenemos los mensajes armados desde el Frontend
    const { messages } = req.body;

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.1-70b-versatile",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const text = chatCompletion.choices[0]?.message?.content || "";
    
    // Devolvemos el texto a la app web
    return res.status(200).json({ text });
  } catch (error) {
    console.error("Vercel API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
