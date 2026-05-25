import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  LayoutDashboard,
  Warehouse,
  AlertTriangle,
  Layers,
  Boxes,
  Building2,
  Search,
  MapPin,
  RefreshCw,
  Check,
  X,
  CheckCircle2,
} from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { StatCard } from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Header from '../components/Header.jsx'
import bodegas from '../data/bodegas.json'
import productos from '../data/productos.json'

const OPERADOR = { nombre: 'Operaciones CHANDO', id: 'OP-01' }
const USER = { nombre: OPERADOR.nombre, sub: `Operador · ${OPERADOR.id}` }

const TITULO = (
  <>
    Centro de Control de Inventario <span className="text-primary">One-Pallet</span>
  </>
)

const CATEGORIA_LABELS = {
  skincare: 'Skincare',
  makeup: 'Maquillaje',
  fragrance: 'Fragancia',
}

// Estado de stock según semáforo
const ESTADO_STOCK = {
  ok: { label: 'OK', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  bajo: { label: 'Bajo', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  critico: { label: 'Crítico', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
}

function estadoStock(cantidad, nivelMinimo) {
  if (cantidad < nivelMinimo * 0.5) return 'critico'
  if (cantidad < nivelMinimo) return 'bajo'
  return 'ok'
}

// Color de la barra de ocupación (verde <70, amarillo 70-90, rojo >90)
function ocupacionColor(pct) {
  if (pct > 90) return 'bg-red-500'
  if (pct >= 70) return 'bg-amber-500'
  return 'bg-green-500'
}

const productoPorId = (id) => productos.find((p) => p.id === id)
const bodegaPorId = (id) => bodegas.find((b) => b.id === id)

/* ------------------------------------------------------------------ */
/* Componente principal                                                */
/* ------------------------------------------------------------------ */

export default function InventoryCenter() {
  const [vista, setVista] = useState('general')
  const [bodegaSel, setBodegaSel] = useState(bodegas[0].id)
  const { inventario, alertas, metricas, aprobarReabastecimiento, rechazarAlerta } = useData()

  const aprobar = (a) => {
    aprobarReabastecimiento(a.productoId, a.bodegaId)
    toast.success('Reabastecimiento aprobado')
  }
  const rechazar = (a) => {
    rechazarAlerta(a.productoId, a.bodegaId)
    toast('Alerta rechazada', { icon: '✕' })
  }
  const verDetalle = (bodegaId) => {
    setBodegaSel(bodegaId)
    setVista('detalle')
  }

  const items = [
    { id: 'general', label: 'Vista General', icon: LayoutDashboard },
    { id: 'detalle', label: 'Detalle por Bodega', icon: Warehouse },
    {
      id: 'alertas',
      label: 'Alertas',
      icon: AlertTriangle,
      badge: metricas.alertasPendientes,
      badgeTone: 'danger',
    },
  ]

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-light">
      <Header titulo={TITULO} usuario={USER} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar rol="Operador" items={items} active={vista} onSelect={setVista} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div key={vista} className="animate-fade-in">
            {vista === 'general' && (
              <VistaGeneral metricas={metricas} onVerDetalle={verDetalle} />
            )}
            {vista === 'detalle' && (
              <VistaDetalle
                bodegaId={bodegaSel}
                setBodegaId={setBodegaSel}
                inventario={inventario}
                onReabastecer={(prod) =>
                  toast.success(`Solicitud de reabastecimiento enviada: ${prod.nombre}`)
                }
              />
            )}
            {vista === 'alertas' && (
              <VistaAlertas alertas={alertas} metricas={metricas} aprobar={aprobar} rechazar={rechazar} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* VISTA 1: Vista General                                              */
/* ------------------------------------------------------------------ */

function VistaGeneral({ metricas, onVerDetalle }) {
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('todas')

  const filtradas = useMemo(
    () =>
      bodegas.filter((b) => {
        const coincideCiudad = b.ciudad.toLowerCase().includes(busqueda.toLowerCase())
        const coincideEstado = estado === 'todas' || b.estado === estado
        return coincideCiudad && coincideEstado
      }),
    [busqueda, estado],
  )

  return (
    <div>
      {/* Métricas (calculadas desde los datos) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de SKUs" value={metricas.totalSKUs} icon={Layers} />
        <StatCard
          label="Total de Unidades"
          value={metricas.totalUnidades.toLocaleString('es-GT')}
          icon={Boxes}
        />
        <StatCard
          label="Bodegas Activas"
          value={`${metricas.bodegasActivas} / ${metricas.totalBodegas}`}
          icon={Building2}
        />
        <StatCard
          label="Alertas Pendientes"
          value={metricas.alertasPendientes}
          delta="Requiere atención"
          positive={false}
          icon={AlertTriangle}
        />
      </div>

      {/* Filtros */}
      <div className="mb-6 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            type="text"
            placeholder="Buscar por ciudad..."
            className="w-full rounded-xl border border-primary-light/40 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded-xl border border-primary-light/40 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
        >
          <option value="todas">Todos los estados</option>
          <option value="activa">Activa</option>
          <option value="mantenimiento">Mantenimiento</option>
        </select>
      </div>

      {/* Grid de bodegas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtradas.map((b) => (
          <BodegaCard key={b.id} bodega={b} onVerDetalle={() => onVerDetalle(b.id)} />
        ))}
      </div>
      {filtradas.length === 0 && (
        <p className="mt-10 text-center text-gray-500">No se encontraron bodegas.</p>
      )}
    </div>
  )
}

function BodegaCard({ bodega, onVerDetalle }) {
  const enMantenimiento = bodega.estado === 'mantenimiento'
  return (
    <div className="rounded-2xl border border-primary-light/30 bg-white p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-dark">{bodega.nombre}</h3>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={12} /> {bodega.ciudad}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            enMantenimiento ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {enMantenimiento ? 'Mantenimiento' : 'Activa'}
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-gray-500">Ocupación</span>
          <span className="font-semibold text-dark">{bodega.ocupacionActual}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${ocupacionColor(bodega.ocupacionActual)}`}
            style={{ width: `${bodega.ocupacionActual}%` }}
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Capacidad: {bodega.capacidad.toLocaleString('es-GT')} uds
      </p>

      <Button variant="outline" size="sm" className="mt-4 w-full" onClick={onVerDetalle}>
        Ver detalle
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* VISTA 2: Detalle por Bodega                                         */
/* ------------------------------------------------------------------ */

function VistaDetalle({ bodegaId, setBodegaId, inventario, onReabastecer }) {
  const [busqueda, setBusqueda] = useState('')
  const bodega = bodegaPorId(bodegaId)

  const productosBodega = useMemo(() => {
    return inventario
      .filter((i) => i.bodegaId === bodegaId)
      .map((i) => {
        const prod = productoPorId(i.productoId)
        return {
          ...i,
          nombre: prod?.nombre ?? `Producto #${i.productoId}`,
          sku: prod?.sku ?? '—',
          categoria: prod?.categoria,
          estadoStock: estadoStock(i.cantidad, i.nivelMinimo),
        }
      })
      .filter((p) => {
        const q = busqueda.toLowerCase()
        return p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      })
  }, [bodegaId, busqueda, inventario])

  return (
    <div>
      {/* Selector de bodega */}
      <div className="mb-6 flex items-center gap-2">
        <Warehouse size={20} className="text-primary" />
        <select
          value={bodegaId}
          onChange={(e) => setBodegaId(Number(e.target.value))}
          className="rounded-xl border border-primary-light/40 bg-white px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none"
        >
          {bodegas.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Información general */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoTile label="Bodega" value={bodega.nombre} />
        <InfoTile label="Ciudad" value={bodega.ciudad} />
        <InfoTile label="Capacidad" value={`${bodega.capacidad.toLocaleString('es-GT')} uds`} />
        <InfoTile
          label="Ocupación"
          value={`${bodega.ocupacionActual}%`}
          barra={bodega.ocupacionActual}
        />
      </div>

      {/* Búsqueda */}
      <div className="relative mb-4 mt-8 max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          type="text"
          placeholder="Buscar por SKU o nombre..."
          className="w-full rounded-xl border border-primary-light/40 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {/* Tabla de productos */}
      <div className="overflow-hidden rounded-2xl border border-primary-light/30 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-primary-light/40 bg-light/60 text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 text-right font-medium">Cantidad</th>
                <th className="px-4 py-3 text-right font-medium">Nivel Mín.</th>
                <th className="px-4 py-3 text-center font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {productosBodega.map((p) => {
                const critico = p.estadoStock === 'critico'
                const est = ESTADO_STOCK[p.estadoStock]
                return (
                  <tr
                    key={p.productoId}
                    className={`border-b border-primary-light/20 transition-colors last:border-0 ${
                      critico ? 'bg-red-50 hover:bg-red-100/70' : 'hover:bg-light/70'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                    <td className="px-4 py-3 font-medium text-dark">{p.nombre}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {CATEGORIA_LABELS[p.categoria] ?? p.categoria}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-dark">
                      {p.cantidad.toLocaleString('es-GT')}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {p.nivelMinimo.toLocaleString('es-GT')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${est.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${est.dot}`} />
                        {est.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {critico ? (
                        <button
                          onClick={() => onReabastecer(p)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-primary-dark active:scale-95"
                        >
                          <RefreshCw size={14} /> Reabastecer
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {productosBodega.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500">
            No hay productos que coincidan en esta bodega.
          </p>
        )}
      </div>
    </div>
  )
}

function InfoTile({ label, value, barra }) {
  return (
    <div className="rounded-2xl border border-primary-light/30 bg-white p-4 shadow-soft">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 truncate font-bold text-dark">{value}</p>
      {barra != null && (
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full ${ocupacionColor(barra)}`}
            style={{ width: `${barra}%` }}
          />
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* VISTA 3: Alertas de Reabastecimiento                                */
/* ------------------------------------------------------------------ */

function VistaAlertas({ alertas, metricas, aprobar, rechazar }) {
  const pendientes = alertas.filter((a) => a.estado === 'pendiente')

  return (
    <div>
      {/* Estadísticas */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <StatCard
          label="Alertas Pendientes"
          value={pendientes.length}
          delta="Requiere revisión"
          positive={false}
          icon={AlertTriangle}
        />
        <StatCard
          label="Procesadas Hoy"
          value={metricas.procesadasHoy}
          delta="Reabastecimientos aprobados"
          positive
          icon={CheckCircle2}
        />
      </div>

      <h2 className="mb-4 text-lg font-bold text-dark">Alertas activas</h2>

      <div className="space-y-3">
        {pendientes.map((a) => (
          <AlertaRow
            key={a.id}
            alerta={a}
            onAprobar={() => aprobar(a)}
            onRechazar={() => rechazar(a)}
          />
        ))}
        {pendientes.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary-light bg-white py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 size={26} />
            </div>
            <p className="mt-3 font-semibold text-dark">No hay alertas pendientes</p>
            <p className="text-sm text-gray-500">Todo el inventario está bajo control.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function AlertaRow({ alerta, onAprobar, onRechazar }) {
  const prod = productoPorId(alerta.productoId)
  const bodega = bodegaPorId(alerta.bodegaId)
  const nivel = estadoStock(alerta.cantidad, alerta.nivelMinimo)
  const est = ESTADO_STOCK[nivel]
  const sugerida = alerta.nivelMinimo * 2

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-primary-light/30 bg-white p-4 shadow-soft transition-all hover:shadow-lg lg:flex-row lg:items-center">
      <div className="flex items-center gap-3 lg:w-72">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${est.badge}`}>
          <AlertTriangle size={20} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-dark">{prod?.nombre}</p>
          <p className="font-mono text-xs text-gray-400">{prod?.sku}</p>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Dato label="Bodega" valor={bodega?.ciudad} />
        <Dato label="Stock actual" valor={alerta.cantidad.toLocaleString('es-GT')} resaltar={nivel} />
        <Dato label="Nivel mínimo" valor={alerta.nivelMinimo.toLocaleString('es-GT')} />
        <Dato label="Sugerido" valor={`${sugerida.toLocaleString('es-GT')} uds`} />
      </div>

      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${est.badge}`}>
          {est.label}
        </span>
        <button
          onClick={onAprobar}
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-green-700 active:scale-95"
        >
          <Check size={14} /> Aprobar
        </button>
        <button
          onClick={onRechazar}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100 active:scale-95"
        >
          <X size={14} /> Rechazar
        </button>
      </div>
    </div>
  )
}

function Dato({ label, valor, resaltar }) {
  const color =
    resaltar === 'critico'
      ? 'text-red-600'
      : resaltar === 'bajo'
        ? 'text-amber-600'
        : 'text-dark'
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`font-semibold ${color}`}>{valor}</p>
    </div>
  )
}
