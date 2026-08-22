import './Balance.css'

function formatMonto(n) {
  return `$${Math.abs(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function Balance({ ingresos, gastos }) {
  const totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0)
  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0)
  const balance = totalIngresos - totalGastos
  const positivo = balance >= 0

  return (
    <div className={`balance-tile ${positivo ? 'positivo' : 'negativo'}`}>
      <span className="balance-label">Balance neto (histórico)</span>
      <span className="balance-valor">
        <span aria-hidden="true">{positivo ? '▲' : '▼'}</span>
        {positivo ? '' : '-'}
        {formatMonto(balance)}
      </span>
    </div>
  )
}

export default Balance
