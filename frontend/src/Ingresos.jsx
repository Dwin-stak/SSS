import { useEffect, useState } from 'react'
import {
  createIngreso,
  deleteIngreso,
  getIngresos,
  interpretarIngreso,
  renombrarCategoriaEnIngresos,
  updateIngreso,
} from './api'
import { useCategoriasIngresos } from './useCategoriasIngresos'
import CategoriasManager from './CategoriasManager'
import './Ingresos.css'

function crearFormVacio(categorias) {
  return {
    descripcion: '',
    monto: '',
    categoria: categorias[0]?.nombre || '',
    fecha: new Date().toISOString().slice(0, 10),
  }
}

function Ingresos({ onIngresosChange }) {
  const { categorias, agregar, editarEmoji, renombrar, borrar, emojiDe } = useCategoriasIngresos()
  const [ingresos, setIngresos] = useState([])
  const [form, setForm] = useState(() => crearFormVacio(categorias))
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [textoLibre, setTextoLibre] = useState('')
  const [interpretando, setInterpretando] = useState(false)
  const [errorInterpretar, setErrorInterpretar] = useState(null)

  useEffect(() => {
    getIngresos()
      .then(setIngresos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    onIngresosChange?.(ingresos)
  }, [ingresos, onIngresosChange])

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
        const updated = await updateIngreso(editingId, payload)
        setIngresos((is) => is.map((i) => (i.id === editingId ? updated : i)))
        setEditingId(null)
      } else {
        const created = await createIngreso(payload)
        setIngresos((is) => [created, ...is])
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
      const resultado = await interpretarIngreso(
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

  function handleEdit(ingreso) {
    setEditingId(ingreso.id)
    setForm({
      descripcion: ingreso.descripcion,
      monto: String(ingreso.monto),
      categoria: ingreso.categoria,
      fecha: ingreso.fecha,
    })
  }

  function handleCancelEdit() {
    setEditingId(null)
    setForm(crearFormVacio(categorias))
  }

  async function handleDelete(id) {
    setError(null)
    try {
      await deleteIngreso(id)
      setIngresos((is) => is.filter((i) => i.id !== id))
      if (editingId === id) handleCancelEdit()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleRenombrarCategoria(id, nuevoNombre) {
    const anterior = renombrar(id, nuevoNombre)
    if (!anterior) return

    try {
      await renombrarCategoriaEnIngresos(anterior, nuevoNombre)
      setIngresos((is) => is.map((i) => (i.categoria === anterior ? { ...i, categoria: nuevoNombre } : i)))
    } catch (err) {
      setError(err.message)
    }
  }

  const total = ingresos.reduce((sum, i) => sum + i.monto, 0)

  return (
    <section className="ingresos-section">
      <h2>Ingresos</h2>

      <form className="texto-libre-form" onSubmit={handleInterpretar}>
        <input
          name="textoLibreIngreso"
          placeholder='Ej: "cobré 500 mil de sueldo"'
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
      ) : ingresos.length === 0 ? (
        <p>No hay ingresos registrados todavía.</p>
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
            {ingresos.map((i) => (
              <tr key={i.id}>
                <td>{i.fecha}</td>
                <td>{i.descripcion}</td>
                <td>
                  {emojiDe(i.categoria)} {i.categoria}
                </td>
                <td className="monto">${i.monto.toFixed(2)}</td>
                <td className="acciones">
                  <button type="button" onClick={() => handleEdit(i)}>
                    Editar
                  </button>
                  <button type="button" className="danger" onClick={() => handleDelete(i.id)}>
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
    </section>
  )
}

export default Ingresos
