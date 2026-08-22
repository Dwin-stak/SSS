import { useEffect, useState } from 'react'
import { createGasto, deleteGasto, getGastos, interpretarGasto, renombrarCategoriaEnGastos, updateGasto } from './api'
import { useCategorias } from './useCategorias'
import Dashboard from './Dashboard'
import Ingresos from './Ingresos'
import Chat from './Chat'
import CategoriasManager from './CategoriasManager'
import './App.css'

function crearFormVacio(categorias) {
  return {
    descripcion: '',
    monto: '',
    categoria: categorias[0]?.nombre || '',
    fecha: new Date().toISOString().slice(0, 10),
  }
}

function App() {
  const { categorias, agregar, editarEmoji, renombrar, borrar, emojiDe } = useCategorias()
  const [gastos, setGastos] = useState([])
  const [ingresos, setIngresos] = useState([])
  const [form, setForm] = useState(() => crearFormVacio(categorias))
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [textoLibre, setTextoLibre] = useState('')
  const [interpretando, setInterpretando] = useState(false)
  const [errorInterpretar, setErrorInterpretar] = useState(null)

  useEffect(() => {
    getGastos()
      .then(setGastos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const payload = { ...form, monto: Number(form.monto) }

    try {
      if (editingId) {
        const updated = await updateGasto(editingId, payload)
        setGastos((gs) => gs.map((g) => (g.id === editingId ? updated : g)))
        setEditingId(null)
      } else {
        const created = await createGasto(payload)
        setGastos((gs) => [created, ...gs])
      }
      setForm(crearFormVacio(categorias))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleInterpretar(e) {
    e.preventDefault()
    if (!textoLibre.trim()) return

    setErrorInterpretar(null)
    setInterpretando(true)
    try {
      const resultado = await interpretarGasto(
        textoLibre.trim(),
        categorias.map((c) => c.nombre),
      )
      setEditingId(null)
      setForm({
        descripcion: resultado.descripcion,
        monto: String(resultado.monto),
        categoria: resultado.categoria,
        fecha: resultado.fecha,
      })
      setTextoLibre('')
    } catch (err) {
      setErrorInterpretar(err.message)
    } finally {
      setInterpretando(false)
    }
  }

  function handleEdit(gasto) {
    setEditingId(gasto.id)
    setForm({
      descripcion: gasto.descripcion,
      monto: String(gasto.monto),
      categoria: gasto.categoria,
      fecha: gasto.fecha,
    })
  }

  function handleCancelEdit() {
    setEditingId(null)
    setForm(crearFormVacio(categorias))
  }

  async function handleDelete(id) {
    setError(null)
    try {
      await deleteGasto(id)
      setGastos((gs) => gs.filter((g) => g.id !== id))
      if (editingId === id) handleCancelEdit()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleRenombrarCategoria(id, nuevoNombre) {
    const anterior = renombrar(id, nuevoNombre)
    if (!anterior) return

    try {
      await renombrarCategoriaEnGastos(anterior, nuevoNombre)
      setGastos((gs) => gs.map((g) => (g.categoria === anterior ? { ...g, categoria: nuevoNombre } : g)))
    } catch (err) {
      setError(err.message)
    }
  }

  const total = gastos.reduce((sum, g) => sum + g.monto, 0)

  return (
    <div id="app" translate="no" className="notranslate">
      <h1>Gastos Tracker</h1>

      {!loading && <Dashboard gastos={gastos} ingresos={ingresos} emojiDe={emojiDe} />}

      <form className="texto-libre-form" onSubmit={handleInterpretar}>
        <input
          name="textoLibre"
          placeholder='Ej: "35 mil en el uber de hoy"'
          value={textoLibre}
          onChange={(e) => setTextoLibre(e.target.value)}
          disabled={interpretando}
        />
        <button type="submit" disabled={interpretando || !textoLibre.trim()}>
          {interpretando ? 'Interpretando...' : 'Interpretar'}
        </button>
      </form>

      {errorInterpretar && <p className="error">{errorInterpretar}</p>}

      <form className="gasto-form" onSubmit={handleSubmit}>
        <input
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
          required
        />
        <input
          name="monto"
          type="number"
          step="0.01"
          min="0"
          placeholder="Monto"
          value={form.monto}
          onChange={handleChange}
          required
        />
        <select name="categoria" value={form.categoria} onChange={handleChange}>
          {categorias.map((c) => (
            <option key={c.id} value={c.nombre}>
              {c.emoji} {c.nombre}
            </option>
          ))}
        </select>
        <input
          name="fecha"
          type="date"
          value={form.fecha}
          onChange={handleChange}
          required
        />
        <button type="submit">{editingId ? 'Guardar' : 'Agregar'}</button>
        {editingId && (
          <button type="button" className="secondary" onClick={handleCancelEdit}>
            Cancelar
          </button>
        )}
      </form>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : gastos.length === 0 ? (
        <p>No hay gastos registrados todavía.</p>
      ) : (
        <table className="gasto-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Monto</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((g) => (
              <tr key={g.id}>
                <td>{g.fecha}</td>
                <td>{g.descripcion}</td>
                <td>
                  {emojiDe(g.categoria)} {g.categoria}
                </td>
                <td className="monto">${g.monto.toFixed(2)}</td>
                <td className="acciones">
                  <button type="button" onClick={() => handleEdit(g)}>
                    Editar
                  </button>
                  <button type="button" className="danger" onClick={() => handleDelete(g.id)}>
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>Total</td>
              <td className="monto">${total.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      )}

      <CategoriasManager
        categorias={categorias}
        onAgregar={agregar}
        onEditarEmoji={editarEmoji}
        onRenombrar={handleRenombrarCategoria}
        onBorrar={borrar}
      />

      <Ingresos onIngresosChange={setIngresos} />

      <Chat />
    </div>
  )
}

export default App
