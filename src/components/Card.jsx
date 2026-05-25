import { TrendingUp, TrendingDown } from 'lucide-react'

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-soft border border-primary-light/30 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// Tarjeta de métrica reutilizable para KPIs / estadísticas
export function StatCard({ label, value, delta, positive = true, icon: Icon }) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-dark">{value}</p>
        {delta && (
          <span
            className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
              positive ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {delta}
          </span>
        )}
      </div>
      {Icon && (
        <div className="rounded-xl bg-primary-light/40 p-3 text-primary">
          <Icon size={22} />
        </div>
      )}
    </Card>
  )
}
