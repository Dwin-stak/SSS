import { useEffect, useState } from 'react'

function cargar(storageKey, seedInicial) {
  try {
    const guardado = localStorage.getItem(storageKey)
    if (guardado) return JSON.parse(guardado)
  } catch {
    // localStorage no disponible o dato corrupto: usamos las categorías iniciales
  }
  return seedInicial
}

function generarId() {
  return `cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function crearHookCategorias(storageKey, seedInicial) {
  return function useCategorias() {
    const [categorias, setCategorias] = useState(() => cargar(storageKey, seedInicial))

    useEffect(() => {
      localStorage.setItem(storageKey, JSON.stringify(categorias))
    }, [categorias])

    function agregar(nombre, emoji) {
      const nombreLimpio = nombre.trim()
      if (!nombreLimpio) return null
      const nueva = { id: generarId(), nombre: nombreLimpio, emoji: emoji.trim() || '🏷️' }
      setCategorias((cs) => [...cs, nueva])
      return nueva
    }

    function editarEmoji(id, emoji) {
      const emojiLimpio = emoji.trim()
      if (!emojiLimpio) return
      setCategorias((cs) => cs.map((c) => (c.id === id ? { ...c, emoji: emojiLimpio } : c)))
    }

    // Devuelve el nombre anterior (o null si no cambió nada) para que quien
    // llame pueda propagar el cambio a los registros ya guardados.
    function renombrar(id, nombre) {
      const nombreLimpio = nombre.trim()
      if (!nombreLimpio) return null

      let anterior = null
      setCategorias((cs) =>
        cs.map((c) => {
          if (c.id !== id || c.nombre === nombreLimpio) return c
          anterior = c.nombre
          return { ...c, nombre: nombreLimpio }
        }),
      )
      return anterior
    }

    function borrar(id) {
      setCategorias((cs) => cs.filter((c) => c.id !== id))
    }

    function emojiDe(nombre) {
      return categorias.find((c) => c.nombre === nombre)?.emoji || ''
    }

    return { categorias, agregar, editarEmoji, renombrar, borrar, emojiDe }
  }
}
