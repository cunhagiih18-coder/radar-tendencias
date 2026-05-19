export const maxDuration = 30

export async function POST() {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    return Response.json({ error: 'ANTHROPIC_API_KEY não configurada.' }, { status: 500 })
  }

  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })

  const prompt = `Você é um analista de tendências de marketing digital e lançamentos de infoprodutos no Brasil.

Hoje é ${today}. Use web search para buscar sinais reais e atuais dos principais portais (Resultados Digitais, Rock Content, Neil Patel BR, Hotmart Blog, Conversion, Product Hackers, newsletters de marketing digital, blogs de lançamento) e retorne os sinais de tendência mais relevantes do momento.

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
      "url": "string — URL real da fonte (se encontrou via search)"
    }
  ]
}

Gere entre 8 e 10 itens. Pelo menos 3 de calor alto. Cubra diferentes categorias. Foco em: IA em lançamentos, novos formatos de conteúdo, comportamento de audiência, ferramentas emergentes, estratégias de copy e funis, plataformas (Hotmart, Eduzz, Kiwify).`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!res.ok) {
      const err = await res.text()
      return Response.json({ error: `API error ${res.status}: ${err}` }, { status: 502 })
    }

    const data = await res.json()

    let jsonText = ''
    for (const block of data.content || []) {
      if (block.type === 'text') jsonText += block.text
    }

    jsonText = jsonText.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(jsonText)

    return Response.json(parsed)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
