import { Router } from 'express'
import { llamarGroq } from './groq.js'

function esFechaValida(fecha) {
  return typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha) && !Number.isNaN(Date.parse(fecha))
}

function construirPrompt(sustantivo, ejemplosMonto, hoy, categorias) {
  return `Sos un asistente que convierte una frase en español informal (rioplatense) sobre un ${sustantivo} personal en un objeto JSON.

Devolvé ÚNICAMENTE un objeto JSON válido, sin texto adicional, con estas claves:
- "monto": number. Es dinero en pesos, sin símbolo ni separadores. Interpretá expresiones informales: ${ejemplosMonto}.
- "categoria": un string, exactamente uno de estos valores: ${categorias.map((c) => `"${c}"`).join(', ')}. Elegí la que mejor describa el ${sustantivo}; si ninguna encaja bien, usá "${categorias[categorias.length - 1]}".
- "fecha": string con formato YYYY-MM-DD. Si el texto no menciona una fecha, usá exactamente "${hoy}" (la fecha de hoy). Interpretá "ayer", "hoy", "el lunes", etc. en relación a esa fecha.
- "descripcion": string corto (2 a 6 palabras) en español que describa el ${sustantivo}, sin incluir el monto ni la fecha.

Si el texto no describe un ${sustantivo} o no tiene un monto identificable, devolvé exactamente: {"error": "motivo breve"}.`
}

export function crearRouterInterpretar({ sustantivo, ejemplosMonto, categoriasPorDefecto }) {
  const router = Router()

  router.post('/', async (req, res) => {
    const { texto, categorias: categoriasBody } = req.body

    if (!texto || typeof texto !== 'string' || !texto.trim()) {
      return res.status(400).json({ error: `Escribí una descripción del ${sustantivo}` })
    }

    const categorias =
      Array.isArray(categoriasBody) &&
      categoriasBody.every((c) => typeof c === 'string' && c.trim()) &&
      categoriasBody.length > 0
        ? categoriasBody
        : categoriasPorDefecto

    const hoy = new Date().toISOString().slice(0, 10)

    let respuestaGroq
    try {
      respuestaGroq = await llamarGroq(
        [
          { role: 'system', content: construirPrompt(sustantivo, ejemplosMonto, hoy, categorias) },
          { role: 'user', content: texto.trim() },
        ],
        { jsonMode: true, temperature: 0 },
      )
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message })
    }

    let extraido
    try {
      extraido = JSON.parse(respuestaGroq)
    } catch {
      return res.status(422).json({ error: `No pude interpretar ese ${sustantivo}, completá el formulario a mano` })
    }

    if (extraido.error) {
      return res.status(422).json({ error: `No pude interpretar ese ${sustantivo}, completá el formulario a mano` })
    }

    const monto = Number(extraido.monto)
    if (!Number.isFinite(monto) || monto <= 0) {
      return res
        .status(422)
        .json({ error: `No pude identificar el monto del ${sustantivo}, completá el formulario a mano` })
    }

    const categoria = categorias.includes(extraido.categoria) ? extraido.categoria : categorias[categorias.length - 1]
    const fecha = esFechaValida(extraido.fecha) ? extraido.fecha : hoy
    const descripcion =
      typeof extraido.descripcion === 'string' && extraido.descripcion.trim()
        ? extraido.descripcion.trim().slice(0, 60)
        : texto.trim().slice(0, 60)

    res.json({ monto, categoria, fecha, descripcion })
  })

  return router
}
