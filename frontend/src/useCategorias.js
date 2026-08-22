import { crearHookCategorias } from './categoriasFactory'

const CATEGORIAS_INICIALES = [
  { id: 'comida', nombre: 'Comida', emoji: '🍔' },
  { id: 'transporte', nombre: 'Transporte', emoji: '🚗' },
  { id: 'vivienda', nombre: 'Vivienda', emoji: '🏠' },
  { id: 'salud', nombre: 'Salud', emoji: '💊' },
  { id: 'ocio', nombre: 'Ocio', emoji: '🎮' },
  { id: 'otros', nombre: 'Otros', emoji: '📦' },
]

export const useCategorias = crearHookCategorias('gastos-tracker:categorias', CATEGORIAS_INICIALES)
