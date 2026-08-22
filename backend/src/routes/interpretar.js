import { crearRouterInterpretar } from '../interpretarFactory.js'

const router = crearRouterInterpretar({
  sustantivo: 'gasto',
  ejemplosMonto: '"35 mil" = 35000, "80 lucas" = 80000, "2.5k" = 2500',
  categoriasPorDefecto: ['Comida', 'Transporte', 'Vivienda', 'Salud', 'Ocio', 'Otros'],
})

export default router
