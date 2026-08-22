const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.1-8b-instant'

export class GroqError extends Error {
  constructor(message, status = 502) {
    super(message)
    this.status = status
  }
}

export async function llamarGroq(messages, { jsonMode = false, temperature = 0 } = {}) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new GroqError('El servidor no tiene configurada GROQ_API_KEY', 500)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  let groqRes
  try {
    groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
        messages,
      }),
      signal: controller.signal,
    })
  } catch (err) {
    console.error('Error llamando a Groq', err)
    throw new GroqError('No se pudo conectar con el servicio de IA')
  } finally {
    clearTimeout(timeout)
  }

  if (!groqRes.ok) {
    const detalle = await groqRes.text().catch(() => '')
    console.error('Groq API error', groqRes.status, detalle)
    throw new GroqError('No se pudo conectar con el servicio de IA')
  }

  const data = await groqRes.json()
  const contenido = data.choices?.[0]?.message?.content
  if (!contenido) {
    throw new GroqError('El servicio de IA no devolvió una respuesta')
  }
  return contenido
}
