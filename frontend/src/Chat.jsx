import { useEffect, useRef, useState } from 'react'
import { chatGastos } from './api'
import './Chat.css'

const SUGERENCIAS = [
  '¿En qué gasté más este mes?',
  '¿Cuánto me queda libre este mes?',
  'Compará este mes con el anterior',
  'Dame consejos para ahorrar',
]

function Chat() {
  const [mensajes, setMensajes] = useState([])
  const [pregunta, setPregunta] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const finRef = useRef(null)

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [mensajes, enviando])

  async function enviar(texto) {
    if (!texto.trim() || enviando) return

    setError(null)
    const historial = [...mensajes, { role: 'user', content: texto.trim() }]
    setMensajes(historial)
    setPregunta('')
    setEnviando(true)

    try {
      const { respuesta } = await chatGastos(historial)
      setMensajes((m) => [...m, { role: 'assistant', content: respuesta }])
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    enviar(pregunta)
  }

  return (
    <section className="chat-card">
      <h2>Preguntale a tus gastos</h2>

      {mensajes.length === 0 && (
        <div className="chat-sugerencias">
          {SUGERENCIAS.map((s) => (
            <button type="button" key={s} onClick={() => enviar(s)} disabled={enviando}>
              {s}
            </button>
          ))}
        </div>
      )}

      {mensajes.length > 0 && (
        <div className="chat-mensajes">
          {mensajes.map((m, i) => (
            <div key={i} className={`chat-burbuja ${m.role}`}>
              {m.content}
            </div>
          ))}
          {enviando && <div className="chat-burbuja assistant chat-cargando">Pensando...</div>}
          <div ref={finRef} />
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          placeholder="Escribí tu pregunta..."
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          disabled={enviando}
        />
        <button type="submit" disabled={enviando || !pregunta.trim()}>
          Preguntar
        </button>
      </form>
    </section>
  )
}

export default Chat
