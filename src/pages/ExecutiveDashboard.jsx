import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  BarChart3,
  ArrowLeftRight,
  FileText,
  Calendar,
  DollarSign,
  Boxes,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  TrendingDown,
  Download,
  FileSpreadsheet,
} from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import bodegas from '../data/bodegas.json'
import kpis from '../data/kpis.json'

const EJECUTIVO = { nombre: 'Dirección Comercial', id: 'EXE-01' }
const USER = { nombre: EJECUTIVO.nombre, sub: `Ejecutivo · ${EJECUTIVO.id}` }

const RANGOS = [
  { id: '7d', label: '7 días' },
  { id: '30d', label: '30 días' },
  { id: '90d', label: '90 días' },
  { id: 'ano', label: 'Año' },
]

const TIPOS_REPORTE = [
  { id: 'comparativo', label: 'Comparativo de Periodos' },
  { id: 'region', label: 'Ventas por Región' },
  { id: 'kpis', label: 'Evolución de KPIs' },
]

function ocupacionBg(pct) {
  if (pct > 90) return 'border-red-200 bg-red-50'
  if (pct >= 70) return 'border-amber-200 bg-amber-50'
  return 'border-green-200 bg-green-50'
}
function ocupacionText(pct) {
  if (pct > 90) return 'text-red-600'
  if (pct >= 70) return 'text-amber-600'
  return 'text-green-600'
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                */
/* ------------------------------------------------------------------ */

export default function ExecutiveDashboard() {
  const [vista, setVista] = useState('kpis')
  const [rango, setRango] = useState('30d')

  const items = [
    { id: 'kpis', label: 'KPIs', icon: BarChart3 },
    { id: 'comparativo', label: 'Análisis Comparativo', icon: ArrowLeftRight },
    { id: 'reportes', label: 'Reportes', icon: FileText },
  ]

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-light">
      <Header
        titulo="Dashboard Ejecutivo"
        usuario={USER}
        acciones={<RangoSelector rango={rango} setRango={setRango} />}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar rol="Ejecutivo" items={items} active={vista} onSelect={setVista} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div key={vista} className="animate-fade-in">
            {vista === 'kpis' && <VistaKpis rango={rango} />}
            {vista === 'comparativo' && <VistaComparativo />}
            {vista === 'reportes' && <VistaReportes />}
          </div>
        </main>
      </div>
    </div>
  )
}

function RangoSelector({ rango, setRango }) {
  return (
    <div className="hidden items-center gap-1 rounded-xl border border-primary-light/40 bg-light p-1 sm:flex">
      <Calendar size={15} className="ml-1.5 text-gray-400" />
      {RANGOS.map((r) => (
        <button
          key={r.id}
          onClick={() => setRango(r.id)}
          className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
            rango === r.id ? 'bg-primary text-white' : 'text-gray-500 hover:text-dark'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Bloques de gráficos reutilizables                                   */
/* ------------------------------------------------------------------ */

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-primary-light/30 bg-white p-6 shadow-soft ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="font-bold text-dark">{title}</h3>}
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

function VentasLineChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={kpis.ventasPorMes} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F8BBD0" vertical={false} />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#6B7280' }} />
        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
        <Tooltip
          formatter={(v) => [`CNY ${v}M`, 'Ventas']}
          contentStyle={{ borderRadius: 12, border: '1px solid #F8BBD0' }}
        />
        <Line
          type="monotone"
          dataKey="ventas"
          stroke="#E91E63"
          strokeWidth={3}
          dot={{ r: 4, fill: '#E91E63' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function RegionBarChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={kpis.ventasPorRegion} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F8BBD0" vertical={false} />
        <XAxis dataKey="region" tick={{ fontSize: 10, fill: '#1F2937' }} interval={0} />
        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
        <Tooltip
          cursor={{ fill: 'rgba(233,30,99,0.06)' }}
          formatter={(v) => [`CNY ${v}M`, 'Ventas']}
          contentStyle={{ borderRadius: 12, border: '1px solid #F8BBD0' }}
        />
        <Bar dataKey="ventas" radius={[8, 8, 0, 0]}>
          {kpis.ventasPorRegion.map((e, i) => (
            <Cell key={i} fill={i % 2 === 0 ? '#E91E63' : '#D4AF37'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function ComparativoTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-primary-light bg-white p-3 text-xs shadow-lg">
      <p className="font-semibold text-dark">{d.metrica}</p>
      <p className="mt-1 text-gray-500">
        Antes: <span className="font-medium text-dark">{d.antesReal}</span>
      </p>
      <p className="text-gray-500">
        Después: <span className="font-medium text-primary">{d.despuesReal}</span>
      </p>
      <p className="mt-1 font-semibold text-green-600">Mejora: {d.mejora}</p>
    </div>
  )
}

function ComparativoBarChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={kpis.comparativoAntesDespues} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F8BBD0" vertical={false} />
        <XAxis dataKey="metrica" tick={{ fontSize: 10, fill: '#1F2937' }} interval={0} />
        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} domain={[0, 100]} />
        <Tooltip content={<ComparativoTooltip />} cursor={{ fill: 'rgba(233,30,99,0.06)' }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="antesIdx" name="Antes" fill="#9CA3AF" radius={[6, 6, 0, 0]} />
        <Bar dataKey="despuesIdx" name="Después" fill="#E91E63" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ------------------------------------------------------------------ */
/* VISTA 1: KPIs                                                       */
/* ------------------------------------------------------------------ */

function VistaKpis({ rango }) {
  const { metricas } = useData()
  const rangoLabel = RANGOS.find((r) => r.id === rango)?.label

  // KPIs calculados desde los datos (ventas e inventario) + métricas de
  // transformación que provienen de kpis.json (despacho, rotación).
  const kpiCards = [
    {
      label: 'Ventas Totales del Mes',
      valor: `Q ${metricas.ventasTotales.toLocaleString('es-GT')}`,
      delta: kpis.ventasTotalesMes.delta,
      trend: kpis.ventasTotalesMes.trend,
      icon: DollarSign,
    },
    {
      label: 'Inventario Consolidado',
      valor: `${metricas.totalUnidades.toLocaleString('es-GT')} uds`,
      delta: kpis.inventarioConsolidado.delta,
      trend: kpis.inventarioConsolidado.trend,
      icon: Boxes,
    },
    {
      label: 'Tiempo Promedio de Despacho',
      valor: kpis.tiempoPromedioDespacho.valor,
      delta: kpis.tiempoPromedioDespacho.delta,
      trend: kpis.tiempoPromedioDespacho.trend,
      icon: Clock,
    },
    {
      label: 'Rotación de Inventario',
      valor: kpis.rotacionInventario.valor,
      delta: kpis.rotacionInventario.delta,
      trend: kpis.rotacionInventario.trend,
      icon: Zap,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Fila 1: KPI cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((c) => (
          <KpiCard key={c.label} {...c} />
        ))}
      </div>

      {/* Fila 2: line + bar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Ventas por mes" subtitle={`Últimos 6 meses · CNY (millones) · ${rangoLabel}`}>
          <div className="h-72">
            <VentasLineChart />
          </div>
        </ChartCard>
        <ChartCard title="Ventas por región" subtitle="Distribución por mercado · CNY (millones)">
          <div className="h-72">
            <RegionBarChart />
          </div>
        </ChartCard>
      </div>

      {/* Fila 3: mapa de bodegas + top productos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BodegasMap />
        </div>
        <TopProductos />
      </div>
    </div>
  )
}

function KpiCard({ label, valor, delta, trend, icon: Icon }) {
  const Arrow = trend === 'up' ? ArrowUpRight : ArrowDownRight
  return (
    <div className="rounded-2xl border border-primary-light/30 bg-white p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <span className="rounded-xl bg-primary-light/40 p-2.5 text-primary">
          <Icon size={20} />
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
          <Arrow size={14} /> {delta}
        </span>
      </div>
      <p className="mt-4 text-2xl font-extrabold text-dark xl:text-3xl">{valor}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  )
}

function BodegasMap() {
  return (
    <ChartCard title="Mapa de bodegas" subtitle="Ocupación por centro de distribución (14 bodegas)">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {bodegas.map((b) => (
          <div
            key={b.id}
            title={`${b.nombre} · ${b.ocupacionActual}%`}
            className={`rounded-xl border p-3 text-center transition-transform hover:scale-105 ${ocupacionBg(b.ocupacionActual)}`}
          >
            <p className="truncate text-xs font-semibold text-dark">{b.ciudad}</p>
            <p className={`mt-1 text-lg font-extrabold ${ocupacionText(b.ocupacionActual)}`}>
              {b.ocupacionActual}%
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> &lt;70%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> 70–90%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> &gt;90%
        </span>
      </div>
    </ChartCard>
  )
}

function TopProductos() {
  const max = Math.max(...kpis.topProductos.map((p) => p.ventas))
  return (
    <ChartCard title="Top 5 productos" subtitle="Más vendidos del mes (uds.)">
      <div className="space-y-4">
        {kpis.topProductos.map((p, i) => (
          <div key={p.sku} className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light/50 text-xs font-bold text-primary">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-dark">{p.nombre}</span>
                <span className="shrink-0 text-sm font-semibold text-dark">
                  {p.ventas.toLocaleString('es-GT')}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(p.ventas / max) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

/* ------------------------------------------------------------------ */
/* VISTA 2: Análisis Comparativo                                       */
/* ------------------------------------------------------------------ */

function VistaComparativo() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary-light/30 bg-gradient-to-br from-dark to-primary-dark p-6 text-white">
        <h2 className="text-lg font-bold">Antes vs. Después de la transformación digital</h2>
        <p className="mt-1 text-sm text-white/70">
          Impacto de la consolidación logística y la digitalización del canal de marketing.
        </p>
      </div>

      {/* Cards de mejora */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.comparativoAntesDespues.map((item) => (
          <MejoraCard key={item.metrica} item={item} />
        ))}
      </div>

      {/* Gráfico de barras agrupadas */}
      <ChartCard
        title="Comparativa Antes / Después"
        subtitle="Índice relativo (Antes = 100) · pasa el cursor para ver valores reales"
      >
        <div className="h-80">
          <ComparativoBarChart />
        </div>
      </ChartCard>
    </div>
  )
}

function MejoraCard({ item }) {
  return (
    <div className="rounded-2xl border border-primary-light/30 bg-white p-5 shadow-soft transition-all hover:shadow-lg">
      <p className="text-sm font-medium text-gray-500">{item.metrica}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm text-gray-400 line-through">{item.antesReal}</span>
        <ArrowRight size={16} className="shrink-0 text-primary" />
        <span className="text-lg font-bold text-dark">{item.despuesReal}</span>
      </div>
      <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
        <TrendingDown size={14} /> {item.mejora} de mejora
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* VISTA 3: Reportes                                                   */
/* ------------------------------------------------------------------ */

function VistaReportes() {
  const [tipo, setTipo] = useState('comparativo')
  const [desde, setDesde] = useState('2026-04-01')
  const [hasta, setHasta] = useState('2026-05-24')
  const [formato, setFormato] = useState('pdf')
  const [reporte, setReporte] = useState(null)

  const generar = () => {
    setReporte({ tipo, desde, hasta, formato })
    toast.success('Reporte generado exitosamente')
  }

  const descargar = (fmt) =>
    toast.success(`Reporte descargado en formato ${fmt.toUpperCase()}`)

  const tipoLabel = TIPOS_REPORTE.find((t) => t.id === tipo)?.label

  return (
    <div className="space-y-6">
      {/* Formulario */}
      <ChartCard title="Generador de reportes" subtitle="Configura y exporta tus reportes ejecutivos">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Campo label="Tipo de reporte">
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full rounded-lg border border-primary-light/40 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            >
              {TIPOS_REPORTE.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Desde">
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full rounded-lg border border-primary-light/40 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </Campo>
          <Campo label="Hasta">
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full rounded-lg border border-primary-light/40 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </Campo>
          <Campo label="Formato">
            <select
              value={formato}
              onChange={(e) => setFormato(e.target.value)}
              className="w-full rounded-lg border border-primary-light/40 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </Campo>
        </div>
        <Button onClick={generar} className="mt-5">
          <FileText size={16} /> Generar Reporte
        </Button>
      </ChartCard>

      {/* Preview */}
      {reporte && (
        <ChartCard
          title={`Reporte: ${tipoLabel}`}
          subtitle={`Periodo: ${reporte.desde} → ${reporte.hasta}`}
          className="animate-fade-in"
        >
          <div className="mb-5 flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => descargar('pdf')}>
              <Download size={16} /> Descargar PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={() => descargar('excel')}>
              <FileSpreadsheet size={16} /> Descargar Excel
            </Button>
          </div>
          <ReportePreview tipo={reporte.tipo} />
        </ChartCard>
      )}
    </div>
  )
}

function Campo({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  )
}

function ReportePreview({ tipo }) {
  if (tipo === 'region') {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-72">
          <RegionBarChart />
        </div>
        <TablaSimple
          columnas={['Región', 'Ventas (CNY M)']}
          filas={kpis.ventasPorRegion.map((r) => [r.region, r.ventas.toLocaleString('es-GT')])}
        />
      </div>
    )
  }
  if (tipo === 'kpis') {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-72">
          <VentasLineChart />
        </div>
        <TablaSimple
          columnas={['Indicador', 'Valor', 'Variación']}
          filas={[
            ['Ventas del mes', kpis.ventasTotalesMes.valor, kpis.ventasTotalesMes.delta],
            ['Inventario', kpis.inventarioConsolidado.valor, kpis.inventarioConsolidado.delta],
            ['Despacho', kpis.tiempoPromedioDespacho.valor, kpis.tiempoPromedioDespacho.delta],
            ['Rotación', kpis.rotacionInventario.valor, kpis.rotacionInventario.delta],
          ]}
        />
      </div>
    )
  }
  // comparativo
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="h-72">
        <ComparativoBarChart />
      </div>
      <TablaSimple
        columnas={['Métrica', 'Antes', 'Después', 'Mejora']}
        filas={kpis.comparativoAntesDespues.map((c) => [
          c.metrica,
          c.antesReal,
          c.despuesReal,
          c.mejora,
        ])}
      />
    </div>
  )
}

function TablaSimple({ columnas, filas }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-primary-light/30">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-primary-light/40 bg-light/60 text-xs uppercase text-gray-500">
            {columnas.map((c) => (
              <th key={c} className="px-4 py-2.5 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={i} className="border-b border-primary-light/20 transition-colors last:border-0 hover:bg-light/70">
              {fila.map((celda, j) => (
                <td key={j} className={`px-4 py-2.5 ${j === 0 ? 'font-medium text-dark' : 'text-gray-600'}`}>
                  {celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
