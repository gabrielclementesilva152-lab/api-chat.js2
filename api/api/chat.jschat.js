import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Apenas método POST é permitido.' } });
  }

  try {
    const { messages } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: { message: 'A chave GEMINI_API_KEY não foi encontrada nas variáveis de ambiente da Vercel.' } 
      });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Monta o formato correto aceito pelo Gemini
    const contents = (messages || []).map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text || '' }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: `Você é o Help, um tutor educacional socrático amigável para estudantes. 
        Sua missão é ensinar o aluno a pensar por conta própria. 
        Nunca dê a resposta pronta de imediato; faça perguntas orientadoras, dê pistas e incentive o raciocínio crítico.`,
      },
    });

    // Pega o texto gerado da resposta
    const replyText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";

    return res.status(200).json({ reply: replyText });
  } catch (error) {
    console.error("Erro na API:", error);
    return res.status(500).json({ error: { message: error.message || 'Erro interno no servidor.' } });
  }
}
