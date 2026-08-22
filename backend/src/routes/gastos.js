import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.get('/', (req, res) => {
  const gastos = db.prepare('SELECT * FROM gastos ORDER BY fecha DESC, id DESC').all()
  res.json(gastos)
})

router.post('/', (req, res) => {
  const { descripcion, monto, categoria, fecha } = req.body

  if (!descripcion || monto == null || !categoria || !fecha) {
    return res.status(400).json({ error: 'Faltan campos requeridos: descripcion, monto, categoria, fecha' })
  }

  const info = db
    .prepare('INSERT INTO gastos (descripcion, monto, categoria, fecha) VALUES (?, ?, ?, ?)')
    .run(descripcion, monto, categoria, fecha)

  const gasto = db.prepare('SELECT * FROM gastos WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(gasto)
})

router.patch('/categoria', (req, res) => {
  const { anterior, nueva } = req.body

  if (!anterior || !nueva || typeof anterior !== 'string' || typeof nueva !== 'string') {
    return res.status(400).json({ error: 'Faltan campos requeridos: anterior, nueva' })
  }

  const info = db.prepare('UPDATE gastos SET categoria = ? WHERE categoria = ?').run(nueva, anterior)
  res.json({ actualizados: info.changes })
})

router.put('/:id', (req, res) => {
  const { id } = req.params
  const existing = db.prepare('SELECT * FROM gastos WHERE id = ?').get(id)

  if (!existing) {
    return res.status(404).json({ error: 'Gasto no encontrado' })
  }

  const { descripcion, monto, categoria, fecha } = req.body

  db.prepare(
    'UPDATE gastos SET descripcion = ?, monto = ?, categoria = ?, fecha = ? WHERE id = ?'
  ).run(
    descripcion ?? existing.descripcion,
    monto ?? existing.monto,
    categoria ?? existing.categoria,
    fecha ?? existing.fecha,
    id
  )

  const updated = db.prepare('SELECT * FROM gastos WHERE id = ?').get(id)
  res.json(updated)
})

router.delete('/:id', (req, res) => {
  const { id } = req.params
  const info = db.prepare('DELETE FROM gastos WHERE id = ?').run(id)

  if (info.changes === 0) {
    return res.status(404).json({ error: 'Gasto no encontrado' })
  }

  res.status(204).send()
})

export default router
