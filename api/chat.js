import Groq from "groq-sdk";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;
  if (!messages) {
    return res.status(400).json({ error: 'Missing messages' });
  }

  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
    });

    res.status(200).json({ result: completion.choices[0]?.message?.content || "" });
  } catch (error) {
    console.error("Error from Groq:", error);
    if (error.status === 429) {
      res.status(429).json({ error: 'Cuota de IA excedida o demasiadas peticiones simultáneas.' });
    } else {
      res.status(500).json({ error: error.message || 'Error processing AI request' });
    }
  }
}
