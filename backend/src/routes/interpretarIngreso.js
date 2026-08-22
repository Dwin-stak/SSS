import { crearRouterInterpretar } from '../interpretarFactory.js'

const router = crearRouterInterpretar({
  sustantivo: 'ingreso',
  ejemplosMonto: '"500 mil" = 500000, "cobré 80 lucas" = 80000, "1.5k" = 1500',
  categoriasPorDefecto: ['Salario', 'Freelance', 'Regalo', 'Otros'],
})

export default router
