async function request(url, options) {
  const res = await fetch(url, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Error ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

function crearApiRecurso(base) {
  return {
    listar: () => request(base),
    crear: (item) =>
      request(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      }),
    actualizar: (id, item) =>
      request(`${base}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      }),
    eliminar: (id) => request(`${base}/${id}`, { method: 'DELETE' }),
    interpretar: (texto, categorias) =>
      request(`${base}/interpretar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto, categorias }),
      }),
    renombrarCategoria: (anterior, nueva) =>
      request(`${base}/categoria`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anterior, nueva }),
      }),
  }
}

const gastosApi = crearApiRecurso('/api/gastos')
const ingresosApi = crearApiRecurso('/api/ingresos')

export const getGastos = gastosApi.listar
export const createGasto = gastosApi.crear
export const updateGasto = gastosApi.actualizar
export const deleteGasto = gastosApi.eliminar
export const interpretarGasto = gastosApi.interpretar
export const renombrarCategoriaEnGastos = gastosApi.renombrarCategoria

export const getIngresos = ingresosApi.listar
export const createIngreso = ingresosApi.crear
export const updateIngreso = ingresosApi.actualizar
export const deleteIngreso = ingresosApi.eliminar
export const interpretarIngreso = ingresosApi.interpretar
export const renombrarCategoriaEnIngresos = ingresosApi.renombrarCategoria

export function chatGastos(mensajes) {
  return request('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mensajes }),
  })
}
