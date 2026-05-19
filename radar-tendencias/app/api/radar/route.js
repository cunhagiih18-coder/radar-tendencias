export const maxDuration = 30

export async function POST() {
  const key = process.env.GOOGLE_API_KEY
  if (!key) {
    return Response.json({ error: 'GOOGLE_API_KEY não configurada.' }, { status: 500 })
  }

  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })

  const prompt = `Você é um analista de tendências de marketing digital e lançamentos de infoprodutos no Brasil.

Hoje é ${today}. Sua tarefa é identificar os sinais de tendência mais relevantes do momento nos principais portais (Resultados Digitais, Rock Content, Neil Patel BR, Hotmart Blog, Conversion, Product Hackers, newsletters de marketing digital, blogs de lançamento).

Retorne APENAS um JSON válido, sem markdown, sem explicação, sem blocos de código. Formato exato:
{
  "itens": [
    {
      "titulo": "string — título da tendência (máx 12 palavras)",
      "resumo": "string — análise em 2 frases diretas sobre o que isso significa para quem faz lançamentos digitais",
      "categoria": "lancamento | ferramenta | estrategia | comportamento | tendencia",
      "calor": "alto | médio | baixo",
      "fonte": "string — nome do portal ou newsletter",
      "tags": ["2 a 4 palavras-chave"],
      "url": "string — URL real da fonte"
    }
  ]
}

Gere entre 8 e 10 itens variados. Pelo menos 3 de calor alto. Cubra diferentes categorias. Foco em: IA em lançamentos, novos formatos de conteúdo, comportamento de audiência, ferramentas emergentes, estratégias de copy e funis, plataformas (Hotmart, Eduzz, Kiwify). Reflita tendências reais de 2025-2026.`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000
          }
        })
      }
    )

    if (!res.ok) {
      const err = await res.text()
      return Response.json({ error: `Gemini API error ${res.status}: ${err}` }, { status: 502 })
    }

    const data = await res.json()
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    text = text.replace(/```json|```/g, '').trim()

    const parsed = JSON.parse(text)
    return Response.json(parsed)

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
