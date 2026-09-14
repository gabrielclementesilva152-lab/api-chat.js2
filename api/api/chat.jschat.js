module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { messages } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Chave GEMINI_API_KEY não encontrada nas variáveis de ambiente.' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: "Você é o Help, um tutor escolar inteligente. Responda sempre em português. JAMAIS dê respostas prontas diretamente. Faça perguntas guiadas e explicativas para ajudar o aluno a raciocinar e descobrir a resposta por conta própria."
            }]
          },
          contents: messages || []
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || "Erro retornado pela API do Gemini." });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: "Erro interno no servidor: " + err.message });
  }
};

