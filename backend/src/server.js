import express from 'express'
import cors from 'cors'
import gastosRouter from './routes/gastos.js'
import interpretarRouter from './routes/interpretar.js'
import ingresosRouter from './routes/ingresos.js'
import interpretarIngresoRouter from './routes/interpretarIngreso.js'
import chatRouter from './routes/chat.js'

try {
  process.loadEnvFile()
} catch {
  // no .env file present; env vars may be set another way
}

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/gastos', gastosRouter)
app.use('/api/gastos/interpretar', interpretarRouter)
app.use('/api/ingresos', ingresosRouter)
app.use('/api/ingresos/interpretar', interpretarIngresoRouter)
app.use('/api/chat', chatRouter)

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`)
})
