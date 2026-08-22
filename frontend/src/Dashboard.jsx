import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Balance from './Balance'
import './Dashboard.css'

const MESES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

function formatMonto(n) {
  return `$${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatMontoCompacto(n) {
  if (n < 1000) return `$${n}`
  const miles = n / 1000
  const texto = Number.isInteger(miles) ? miles : miles.toFixed(1)
  return `$${texto}k`
}

function porCategoria(gastos, emojiDe) {
  const totales = new Map()
  for (const g of gastos) {
    totales.set(g.categoria, (totales.get(g.categoria) || 0) + g.monto)
  }
  return [...totales.entries()]
    .map(([categoria, total]) => ({
      categoria: emojiDe(categoria) ? `${emojiDe(categoria)} ${categoria}` : categoria,
      total,
    }))
    .sort((a, b) => b.total - a.total)
}

function porMesComparado(gastos, ingresos) {
  const meses = new Map()

  function sumar(lista, clave) {
    for (const item of lista) {
      const mesClave = item.fecha.slice(0, 7)
      const actual = meses.get(mesClave) || { ingreso: 0, gasto: 0 }
      actual[clave] += item.monto
      meses.set(mesClave, actual)
    }
  }
  sumar(gastos, 'gasto')
  sumar(ingresos, 'ingreso')

  return [...meses.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([clave, valores]) => {
      const [anio, mes] = clave.split('-')
      return { clave, label: `${MESES[Number(mes) - 1]} ${anio}`, ...valores }
    })
}

function ChartTooltip({ active, payload, labelKey }) {
  if (!active || !payload?.length) return null
  const punto = payload[0].payload
  return (
    <div className="chart-tooltip">
      <strong>{formatMonto(punto.total)}</strong>
      <span>{punto[labelKey]}</span>
    </div>
  )
}

function ComparativoTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const punto = payload[0].payload
  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip-mes">{punto.label}</span>
      <div className="chart-tooltip-fila">
        <span className="chart-tooltip-key" style={{ background: 'var(--success)' }} />
        <span>Ingresos</span>
        <strong>{formatMonto(punto.ingreso)}</strong>
      </div>
      <div className="chart-tooltip-fila">
        <span className="chart-tooltip-key" style={{ background: 'var(--chart-series-1)' }} />
        <span>Gastos</span>
        <strong>{formatMonto(punto.gasto)}</strong>
      </div>
    </div>
  )
}

function EmptyState() {
  return <p className="dashboard-empty">Agregá tu primer gasto o ingreso para ver el resumen.</p>
}

function Dashboard({ gastos, ingresos, emojiDe }) {
  if (gastos.length === 0 && ingresos.length === 0) return <EmptyState />

  const datosCategoria = porCategoria(gastos, emojiDe)
  const datosMes = porMesComparado(gastos, ingresos)

  return (
    <>
      <Balance ingresos={ingresos} gastos={gastos} />

      <section className="dashboard">
        <div className="chart-card">
          <h2>Gastos por categoría</h2>
          <ResponsiveContainer width="100%" height={Math.max(datosCategoria.length * 44, 120)}>
            <BarChart
              data={datosCategoria}
              layout="vertical"
              margin={{ top: 4, right: 56, bottom: 4, left: 4 }}
            >
              <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="categoria"
                width={116}
                tickLine={false}
                axisLine={{ stroke: 'var(--chart-baseline)' }}
                tick={{ fill: 'var(--chart-muted)', fontSize: 13 }}
              />
              <Tooltip
                cursor={{ fill: 'var(--chart-grid)' }}
                content={<ChartTooltip labelKey="categoria" />}
              />
              <Bar dataKey="total" fill="var(--chart-series-1)" barSize={20} radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="total"
                  position="right"
                  formatter={formatMontoCompacto}
                  fill="var(--text)"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Ingresos vs Gastos por mes</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={datosMes} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: 'var(--chart-baseline)' }}
                tick={{ fill: 'var(--chart-muted)', fontSize: 13 }}
              />
              <YAxis hide />
              <Tooltip cursor={{ fill: 'var(--chart-grid)' }} content={<ComparativoTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 13, color: 'var(--text)' }}
              />
              <Bar name="Ingresos" dataKey="ingreso" fill="var(--success)" barSize={16} radius={[4, 4, 0, 0]} />
              <Bar name="Gastos" dataKey="gasto" fill="var(--chart-series-1)" barSize={16} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  )
}

export default Dashboard
