import { useState } from 'react'
import './CategoriasManager.css'

function CategoriaRow({ categoria, onEditarEmoji, onRenombrar, onBorrar }) {
  const [nombre, setNombre] = useState(categoria.nombre)

  function commitNombre() {
    const limpio = nombre.trim()
    if (limpio && limpio !== categoria.nombre) {
      onRenombrar(categoria.id, limpio)
    } else {
      setNombre(categoria.nombre)
    }
  }

  return (
    <div className="categoria-row">
      <input
        className="categoria-emoji-input"
        value={categoria.emoji}
        maxLength={8}
        onChange={(e) => onEditarEmoji(categoria.id, e.target.value)}
        aria-label={`Emoji de ${categoria.nombre}`}
      />
      <input
        className="categoria-nombre-input"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        onBlur={commitNombre}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
        aria-label="Nombre de la categoría"
      />
      <button type="button" className="danger" onClick={() => onBorrar(categoria.id)}>
        Borrar
      </button>
    </div>
  )
}

function CategoriasManager({ categorias, onAgregar, onEditarEmoji, onRenombrar, onBorrar }) {
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoEmoji, setNuevoEmoji] = useState('')

  function handleAgregar(e) {
    e.preventDefault()
    if (!nuevoNombre.trim()) return
    onAgregar(nuevoNombre, nuevoEmoji)
    setNuevoNombre('')
    setNuevoEmoji('')
  }

  return (
    <section className="categorias-card">
      <h2>Categorías</h2>
      <p className="categorias-hint">
        Tip: para poner un emoji, abrí el selector de tu sistema (Windows: Win + punto · Mac: Cmd + Ctrl +
        Espacio · celular: teclado de emojis) y pegalo en el casillero.
      </p>

      <div className="categorias-lista">
        {categorias.map((c) => (
          <CategoriaRow
            key={c.id}
            categoria={c}
            onEditarEmoji={onEditarEmoji}
            onRenombrar={onRenombrar}
            onBorrar={onBorrar}
          />
        ))}
      </div>

      <form className="categoria-nueva-form" onSubmit={handleAgregar}>
        <input
          className="categoria-emoji-input"
          placeholder="🏷️"
          value={nuevoEmoji}
          maxLength={8}
          onChange={(e) => setNuevoEmoji(e.target.value)}
          aria-label="Emoji de la nueva categoría"
        />
        <input
          placeholder="Nueva categoría..."
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          aria-label="Nombre de la nueva categoría"
        />
        <button type="submit" disabled={!nuevoNombre.trim()}>
          Agregar categoría
        </button>
      </form>
    </section>
  )
}

export default CategoriasManager
