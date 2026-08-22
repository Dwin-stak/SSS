import { Router } from 'express'
import db from '../db.js'
import { llamarGroq } from '../groq.js'

const router = Router()

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const MESES_DE_HISTORIA = 12
const MAX_MENSAJES_CONTEXTO = 20

function nombreMes(clave) {
  const [anio, mes] = clave.split('-')
  return `${MESES[Number(mes) - 1]} ${anio}`
}

function formatMonto(n) {
  return `$${n.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

function construirCsv(movimientos, etiquetaVacio) {
  if (movimientos.length === 0) return etiquetaVacio
  const filas = movimientos.map((m) => `${m.fecha},${m.categoria},${m.monto},${m.descripcion}`).join('\n')
  return `fecha,categoria,monto,descripcion\n${filas}`
}

function construirSistema({ gastos, ingresos, totalGastosHistorico, totalIngresosHistorico, hoy }) {
  const mesActual = hoy.slice(0, 7)
  const fechaMesAnterior = new Date(hoy)
  fechaMesAnterior.setMonth(fechaMesAnterior.getMonth() - 1)
  const mesAnterior = fechaMesAnterior.toISOString().slice(0, 7)
  const balanceHistorico = totalIngresosHistorico - totalGastosHistorico

  return `Sos un asistente financiero que responde preguntas sobre las finanzas personales del usuario (ingresos y gastos), en español rioplatense, de forma breve y concreta (párrafo corto o lista breve, sin rodeos).

Reglas:
- Usá ÚNICAMENTE los datos provistos abajo. Nunca inventes montos, fechas, categorías o movimientos que no estén en los datos.
- Si la pregunta no se puede responder con estos datos, decilo explícitamente en vez de adivinar o estimar.
- Hoy es ${hoy}. "Este mes" es ${nombreMes(mesActual)} (${mesActual}). "El mes pasado" es ${nombreMes(mesAnterior)} (${mesAnterior}).
- Para "¿cuánto me queda libre este mes?" o similar: restá el total de gastos del mes al total de ingresos de ese mismo mes, usando los CSV de abajo.
- El balance neto histórico acumulado (todos los ingresos menos todos los gastos desde el primer registro, no solo los últimos ${MESES_DE_HISTORIA} meses) ya está calculado: ${formatMonto(balanceHistorico)}. Usalo tal cual para preguntas sobre el balance total o acumulado, no lo recalcules con los CSV de abajo porque esos están recortados a los últimos ${MESES_DE_HISTORIA} meses.
- Para dar consejos de ahorro, basate en los patrones reales de estos datos (categorías con más gasto, gastos recurrentes, relación ingreso/gasto); no des consejos genéricos desconectados de los datos.
- Los montos están en pesos argentinos; formateálos con puntos de miles al responder (ej. $45.000).
- Respondé en texto plano, sin markdown: nada de **negrita**, #, backticks ni asteriscos. Para listas, usá un guion simple al inicio de cada línea.

Ingresos registrados (CSV: fecha,categoria,monto,descripcion), últimos ${MESES_DE_HISTORIA} meses:
${construirCsv(ingresos, 'No hay ingresos registrados.')}

Gastos registrados (CSV: fecha,categoria,monto,descripcion), últimos ${MESES_DE_HISTORIA} meses:
${construirCsv(gastos, 'No hay gastos registrados.')}`
}

function mensajesValidos(mensajes) {
  return (
    Array.isArray(mensajes) &&
    mensajes.length > 0 &&
    mensajes.every(
      (m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim(),
    ) &&
    mensajes[mensajes.length - 1].role === 'user'
  )
}

router.post('/', async (req, res) => {
  const { mensajes } = req.body

  if (!mensajesValidos(mensajes)) {
    return res.status(400).json({ error: 'Falta el mensaje o la conversación es inválida' })
  }

  const hoy = new Date().toISOString().slice(0, 10)
  const cutoff = new Date(hoy)
  cutoff.setMonth(cutoff.getMonth() - MESES_DE_HISTORIA)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const gastos = db
    .prepare('SELECT fecha, categoria, monto, descripcion FROM gastos WHERE fecha >= ? ORDER BY fecha ASC')
    .all(cutoffStr)
  const ingresos = db
    .prepare('SELECT fecha, categoria, monto, descripcion FROM ingresos WHERE fecha >= ? ORDER BY fecha ASC')
    .all(cutoffStr)

  const totalGastosHistorico = db.prepare('SELECT COALESCE(SUM(monto), 0) AS total FROM gastos').get().total
  const totalIngresosHistorico = db.prepare('SELECT COALESCE(SUM(monto), 0) AS total FROM ingresos').get().total

  const sistema = construirSistema({ gastos, ingresos, totalGastosHistorico, totalIngresosHistorico, hoy })
  const historial = mensajes
    .slice(-MAX_MENSAJES_CONTEXTO)
    .map((m) => ({ role: m.role, content: m.content.trim() }))

  let respuesta
  try {
    respuesta = await llamarGroq([{ role: 'system', content: sistema }, ...historial], { temperature: 0.3 })
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message })
  }

  res.json({ respuesta })
})

export default router
