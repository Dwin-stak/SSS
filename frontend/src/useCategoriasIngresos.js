import { crearHookCategorias } from './categoriasFactory'

const CATEGORIAS_INICIALES = [
  { id: 'salario', nombre: 'Salario', emoji: '💼' },
  { id: 'freelance', nombre: 'Freelance', emoji: '💻' },
  { id: 'regalo', nombre: 'Regalo', emoji: '🎁' },
  { id: 'otros', nombre: 'Otros', emoji: '📦' },
]

export const useCategoriasIngresos = crearHookCategorias('gastos-tracker:categorias-ingresos', CATEGORIAS_INICIALES)
