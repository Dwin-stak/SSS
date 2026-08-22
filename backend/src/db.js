import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new DatabaseSync(path.join(__dirname, '..', 'gastos.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS gastos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcion TEXT NOT NULL,
    monto REAL NOT NULL,
    categoria TEXT NOT NULL,
    fecha TEXT NOT NULL
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS ingresos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcion TEXT NOT NULL,
    monto REAL NOT NULL,
    categoria TEXT NOT NULL,
    fecha TEXT NOT NULL
  )
`)

export default db
