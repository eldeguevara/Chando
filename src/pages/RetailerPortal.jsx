import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  Store,
  ShoppingCart,
  ClipboardList,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Check,
  X,
  ChevronDown,
  Package,
  MapPin,
  Calendar,
  Eye,
} from 'lucide-react'
import { CartProvider, useCart } from '../context/CartContext.jsx'
import { useData } from '../context/DataContext.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import productos from '../data/productos.json'
import bodegas from '../data/bodegas.json'

// Minorista de demostración (sesión simulada)
const MINORISTA = { nombre: 'Boutique Bella Rosa', id: 'MIN-014' }
const USER = { nombre: MINORISTA.nombre, sub: `Minorista · ${MINORISTA.id}` }

const STOCK_LIMITADO = 50

const CATEGORIA_LABELS = {
  skincare: 'Skincare',
  makeup: 'Maquillaje',
  fragrance: 'Fragancia',
}

const CATEGORIA_BADGE = {
  skincare: 'bg-sky-100 text-sky-700',
  makeup: 'bg-primary-light/60 text-primary-dark',
  fragrance: 'bg-secondary-light/60 text-yellow-800',
}

const ESTADOS = {
  confirmado: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700' },
  preparacion: { label: 'En preparación', color: 'bg-amber-100 text-amber-700' },
  transito: { label: 'En tránsito', color: 'bg-purple-100 text-purple-700' },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-700' },
}
const ESTADO_ORDEN = ['confirmado', 'preparacion', 'transito', 'entregado']

const productoPorId = (id) => productos.find((p) => p.id === id)

/* ------------------------------------------------------------------ */
/* Componente principal                                                */
/* ------------------------------------------------------------------ */

export default function RetailerPortal() {
  return (
    <CartProvider>
      <RetailerPortalInner />
    </CartProvider>
  )
}

function RetailerPortalInner() {
  const [vista, setVista] = useState('catalogo')
  const { totalItems } = useCart()

  const items = [
    { id: 'catalogo', label: 'Catálogo', icon: Store },
    { id: 'carrito', label: 'Mi Carrito', icon: ShoppingCart, badge: totalItems, badgeTone: 'secondary' },
    { id: 'pedidos', label: 'Mis Pedidos', icon: ClipboardList },
  ]

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-light">
      <Header titulo="Portal del Minorista" usuario={USER} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar rol="Minorista" items={items} active={vista} onSelect={setVista} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div key={vista} className="animate-fade-in">
            {vista === 'catalogo' && <CatalogoView />}
            {vista === 'carrito' && (
              <CarritoView
                onIrAPedidos={() => setVista('pedidos')}
                onSeguirComprando={() => setVista('catalogo')}
              />
            )}
            {vista === 'pedidos' && <PedidosView />}
          </div>
        </main>
      </div>
    </div>
  )
}

/* Modal reutilizable */
function Modal({ open, onClose, children, maxWidth = 'max-w-md' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full ${maxWidth} animate-fade-in-fast rounded-2xl bg-white p-6 shadow-xl`}>
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* VISTA 1: Catálogo                                                    */
/* ------------------------------------------------------------------ */

function CatalogoView() {
  const { agregar } = useCart()
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('todas')

  const handleAgregar = (p) => {
    agregar(p.id)
    toast.success('Producto agregado al carrito')
  }

  const filtrados = useMemo(
    () =>
      productos.filter((p) => {
        const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
        const coincideCategoria = categoria === 'todas' || p.categoria === categoria
        return coincideNombre && coincideCategoria
      }),
    [busqueda, categoria],
  )

  return (
    <div>
      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            type="text"
            placeholder="Buscar producto por nombre..."
            className="w-full rounded-xl border border-primary-light/40 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="rounded-xl border border-primary-light/40 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
        >
          <option value="todas">Todas las categorías</option>
          <option value="skincare">Skincare</option>
          <option value="makeup">Maquillaje</option>
          <option value="fragrance">Fragancia</option>
        </select>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {filtrados.map((p) => (
          <ProductoCard key={p.id} producto={p} onAgregar={() => handleAgregar(p)} />
        ))}
      </div>
      {filtrados.length === 0 && (
        <p className="mt-10 text-center text-gray-500">No se encontraron productos.</p>
      )}
    </div>
  )
}

function ProductoCard({ producto, onAgregar }) {
  const agotado = producto.stockTotal === 0
  const limitado = producto.stockTotal > 0 && producto.stockTotal < STOCK_LIMITADO

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-primary-light/30 bg-white shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative overflow-hidden">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {agotado && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white shadow">
            Sin stock
          </span>
        )}
        {limitado && (
          <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white shadow">
            Stock limitado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span
          className={`mb-2 inline-block w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORIA_BADGE[producto.categoria]}`}
        >
          {CATEGORIA_LABELS[producto.categoria]}
        </span>
        <h3 className="font-semibold leading-tight text-dark">{producto.nombre}</h3>
        <p className="mt-0.5 text-xs text-gray-400">{producto.sku}</p>

        <div className="mt-3 flex items-end justify-between">
          <p className="text-lg font-bold text-primary">
            Q {producto.precio.toLocaleString('es-GT')}
          </p>
          <p className="text-xs text-gray-500">
            Stock: {producto.stockTotal.toLocaleString('es-GT')}
          </p>
        </div>

        <Button onClick={onAgregar} disabled={agotado} className="mt-4 w-full">
          <Plus size={16} />
          {agotado ? 'No disponible' : 'Agregar al carrito'}
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* VISTA 2: Carrito                                                     */
/* ------------------------------------------------------------------ */

function CarritoView({ onIrAPedidos, onSeguirComprando }) {
  const { items, totalItems, subtotal, cambiarCantidad, quitar, vaciar } = useCart()
  const { confirmarPedido } = useData()
  const [exito, setExito] = useState(null)

  const handleConfirmar = () => {
    const res = confirmarPedido(items, MINORISTA.id)
    if (res) {
      vaciar()
      toast.success(`Pedido confirmado #${res.numeroPedido}`)
      setExito(res)
    }
  }

  if (items.length === 0 && !exito) {
    return <EmptyCarrito onSeguirComprando={onSeguirComprando} />
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Lista de productos */}
      <div className="space-y-4 lg:col-span-2">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-primary-light/30 bg-white p-4 shadow-soft"
          >
            <img
              src={it.imagen}
              alt={it.nombre}
              className="h-16 w-16 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-dark">{it.nombre}</p>
              <p className="text-xs text-gray-500">{CATEGORIA_LABELS[it.categoria]}</p>
              <p className="mt-1 text-sm font-bold text-primary">
                Q {it.precio.toLocaleString('es-GT')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => cambiarCantidad(it.id, -1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary-light text-primary transition-all hover:bg-primary-light/30 active:scale-90"
                aria-label="Disminuir"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-semibold text-dark">{it.cantidad}</span>
              <button
                onClick={() => cambiarCantidad(it.id, 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary-light text-primary transition-all hover:bg-primary-light/30 active:scale-90"
                aria-label="Aumentar"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="w-24 text-right">
              <p className="font-bold text-dark">Q {it.subtotal.toLocaleString('es-GT')}</p>
              <button
                onClick={() => quitar(it.id)}
                className="mt-1 inline-flex items-center gap-1 text-xs text-red-500 transition-colors hover:text-red-600"
              >
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div>
        <div className="rounded-2xl border border-primary-light/30 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-bold text-dark">Resumen del pedido</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Productos</span>
              <span className="font-medium text-dark">{totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-dark">Q {subtotal.toLocaleString('es-GT')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Envío</span>
              <span className="font-medium text-green-600">Gratis</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-primary-light/40 pt-4">
            <span className="font-semibold text-dark">Total</span>
            <span className="text-xl font-extrabold text-primary">
              Q {subtotal.toLocaleString('es-GT')}
            </span>
          </div>
          <Button onClick={handleConfirmar} size="lg" className="mt-6 w-full">
            Confirmar Pedido
          </Button>
        </div>
      </div>

      {/* Modal de éxito */}
      <Modal open={!!exito} onClose={() => setExito(null)}>
        {exito && (
          <ExitoPedido
            exito={exito}
            onVerPedidos={() => {
              setExito(null)
              onIrAPedidos()
            }}
            onCerrar={() => setExito(null)}
          />
        )}
      </Modal>
    </div>
  )
}

function EmptyCarrito({ onSeguirComprando }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary-light bg-white py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light/40 text-primary">
        <ShoppingCart size={28} />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-dark">Tu carrito está vacío</h2>
      <p className="mt-1 text-sm text-gray-500">
        Agrega productos desde el catálogo para realizar un pedido.
      </p>
      <Button onClick={onSeguirComprando} className="mt-6">
        Ir al catálogo
      </Button>
    </div>
  )
}

function ExitoPedido({ exito, onVerPedidos, onCerrar }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
        <CheckCircle2 size={36} />
      </div>
      <h2 className="mt-4 text-xl font-bold text-dark">¡Pedido confirmado!</h2>
      <p className="mt-1 text-sm text-gray-500">Tu pedido fue registrado correctamente.</p>

      <div className="mt-5 space-y-2 rounded-xl bg-light p-4 text-left text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Número de pedido</span>
          <span className="font-bold text-dark">{exito.numeroPedido}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Bodega asignada</span>
          <span className="font-medium text-dark">{exito.bodegaNombre}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total</span>
          <span className="font-bold text-primary">Q {exito.total.toLocaleString('es-GT')}</span>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={onCerrar} className="flex-1">
          Cerrar
        </Button>
        <Button onClick={onVerPedidos} className="flex-1">
          Ver mis pedidos
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* VISTA 3: Mis Pedidos                                                 */
/* ------------------------------------------------------------------ */

function PedidosView() {
  const { pedidos } = useData()
  const [filtro, setFiltro] = useState('todos')
  const [expandido, setExpandido] = useState(null)
  const [detalle, setDetalle] = useState(null)

  const filtrados = filtro === 'todos' ? pedidos : pedidos.filter((p) => p.estado === filtro)

  return (
    <div>
      {/* Filtros por estado */}
      <div className="mb-6 flex flex-wrap gap-2">
        <FiltroChip activo={filtro === 'todos'} onClick={() => setFiltro('todos')}>
          Todos
        </FiltroChip>
        {ESTADO_ORDEN.map((e) => (
          <FiltroChip key={e} activo={filtro === e} onClick={() => setFiltro(e)}>
            {ESTADOS[e].label}
          </FiltroChip>
        ))}
      </div>

      <div className="space-y-4">
        {filtrados.map((pedido) => (
          <PedidoCard
            key={pedido.id}
            pedido={pedido}
            expandido={expandido === pedido.id}
            onToggle={() => setExpandido(expandido === pedido.id ? null : pedido.id)}
            onDetalle={() => setDetalle(pedido)}
          />
        ))}
        {filtrados.length === 0 && (
          <p className="py-10 text-center text-gray-500">No hay pedidos con este estado.</p>
        )}
      </div>

      {/* Modal de detalle */}
      <Modal open={!!detalle} onClose={() => setDetalle(null)} maxWidth="max-w-lg">
        {detalle && <DetallePedido pedido={detalle} onClose={() => setDetalle(null)} />}
      </Modal>
    </div>
  )
}

function FiltroChip({ activo, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all hover:scale-[1.03] ${
        activo
          ? 'bg-primary text-white'
          : 'border border-primary-light/40 bg-white text-gray-600 hover:bg-primary-light/30'
      }`}
    >
      {children}
    </button>
  )
}

function PedidoCard({ pedido, expandido, onToggle, onDetalle }) {
  const estado = ESTADOS[pedido.estado]

  return (
    <div className="overflow-hidden rounded-2xl border border-primary-light/30 bg-white shadow-soft transition-all hover:shadow-lg">
      <div className="flex flex-wrap items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light/40 text-primary">
          <Package size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-dark">{pedido.numeroPedido}</p>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar size={12} /> {pedido.fecha}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${estado.color}`}>
          {estado.label}
        </span>
        <p className="font-bold text-dark">Q {pedido.total.toLocaleString('es-GT')}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onDetalle}>
            <Eye size={16} /> Ver detalle
          </Button>
          <button
            onClick={onToggle}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-light"
            aria-label="Expandir"
          >
            <ChevronDown
              size={20}
              className={`transition-transform ${expandido ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {expandido && (
        <div className="animate-fade-in-fast border-t border-primary-light/30 bg-light/60 p-5">
          <StatusTimeline estado={pedido.estado} />
          <h4 className="mb-2 mt-6 text-sm font-semibold text-dark">Productos</h4>
          <div className="space-y-2">
            {pedido.productos.map((linea, i) => {
              const prod = productoPorId(linea.productoId)
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {prod ? prod.nombre : `Producto #${linea.productoId}`}
                  </span>
                  <span className="text-gray-500">x{linea.cantidad}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusTimeline({ estado }) {
  const actual = ESTADO_ORDEN.indexOf(estado)

  return (
    <div>
      <div className="flex items-center">
        {ESTADO_ORDEN.map((e, i) => (
          <div key={e} className="flex flex-1 items-center last:flex-none">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i <= actual ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              {i < actual ? <Check size={16} /> : i + 1}
            </div>
            {i < ESTADO_ORDEN.length - 1 && (
              <div className={`mx-2 h-1 flex-1 rounded ${i < actual ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between">
        {ESTADO_ORDEN.map((e, i) => (
          <span
            key={e}
            className={`max-w-[64px] text-[10px] leading-tight ${
              i <= actual ? 'font-medium text-dark' : 'text-gray-400'
            }`}
          >
            {ESTADOS[e].label}
          </span>
        ))}
      </div>
    </div>
  )
}

function DetallePedido({ pedido, onClose }) {
  const estado = ESTADOS[pedido.estado]
  const bodega = bodegas.find((b) => b.id === pedido.bodegaAsignada)

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark">{pedido.numeroPedido}</h2>
          <p className="flex items-center gap-1 text-sm text-gray-500">
            <Calendar size={14} /> {pedido.fecha}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-light"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mt-5">
        <StatusTimeline estado={pedido.estado} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-light p-3">
          <p className="text-gray-500">Estado</p>
          <span
            className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${estado.color}`}
          >
            {estado.label}
          </span>
        </div>
        <div className="rounded-xl bg-light p-3">
          <p className="text-gray-500">Minorista</p>
          <p className="font-medium text-dark">{pedido.minoristaId}</p>
        </div>
        <div className="col-span-2 rounded-xl bg-light p-3">
          <p className="flex items-center gap-1 text-gray-500">
            <MapPin size={14} /> Bodega asignada
          </p>
          <p className="font-medium text-dark">
            {bodega ? `${bodega.nombre} · ${bodega.ciudad}` : `Bodega #${pedido.bodegaAsignada}`}
          </p>
        </div>
      </div>

      <h3 className="mb-2 mt-5 text-sm font-semibold text-dark">Productos</h3>
      <div className="space-y-2">
        {pedido.productos.map((linea, i) => {
          const prod = productoPorId(linea.productoId)
          const sub = prod ? prod.precio * linea.cantidad : 0
          return (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-primary-light/30 px-3 py-2 text-sm"
            >
              <span className="text-dark">
                {prod ? prod.nombre : `Producto #${linea.productoId}`}
              </span>
              <span className="text-gray-500">
                x{linea.cantidad} · Q {sub.toLocaleString('es-GT')}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex justify-between border-t border-primary-light/40 pt-4">
        <span className="font-semibold text-dark">Total</span>
        <span className="text-lg font-extrabold text-primary">
          Q {pedido.total.toLocaleString('es-GT')}
        </span>
      </div>
    </div>
  )
}
