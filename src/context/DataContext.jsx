import { createContext, useContext, useMemo, useState } from 'react'
import inventarioInicial from '../data/inventario.json'
import pedidosIniciales from '../data/pedidos.json'
import bodegas from '../data/bodegas.json'
import productos from '../data/productos.json'

// Estado de dominio COMPARTIDO entre los tres módulos.
// Vive mientras la app está montada, así un pedido confirmado por el
// minorista impacta el inventario que ve el operador y los KPIs del ejecutivo.
const DataContext = createContext(null)

const HOY = '2026-05-24'

// Resta del inventario las cantidades de un pedido (bodega asignada primero).
function restarInventario(inv, items, bodegaId) {
  const copia = inv.map((e) => ({ ...e }))
  items.forEach((item) => {
    let restante = item.cantidad
    const entradas = copia
      .filter((e) => e.productoId === item.id)
      .sort(
        (a, b) =>
          (b.bodegaId === bodegaId ? 1 : 0) - (a.bodegaId === bodegaId ? 1 : 0) ||
          b.cantidad - a.cantidad,
      )
    for (const e of entradas) {
      if (restante <= 0) break
      const tomar = Math.min(e.cantidad, restante)
      e.cantidad -= tomar
      restante -= tomar
    }
  })
  return copia
}

export function DataProvider({ children }) {
  const [inventario, setInventario] = useState(inventarioInicial)
  const [pedidos, setPedidos] = useState(pedidosIniciales)
  const [estadoAlertas, setEstadoAlertas] = useState({}) // { 'pid-bid': 'procesada' | 'rechazada' }

  // Confirmar pedido: genera número + bodega y RESTA del inventario.
  const confirmarPedido = (items, minoristaId = 'MIN-014') => {
    if (!items || items.length === 0) return null

    const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0)
    const maxNum = pedidos.reduce((max, p) => {
      const n = Number(String(p.numeroPedido).split('-').pop())
      return Number.isFinite(n) ? Math.max(max, n) : max
    }, 0)
    const numeroPedido = `PED-2026-${String(maxNum + 1).padStart(4, '0')}`
    const bodega = bodegas[Math.floor(Math.random() * bodegas.length)]

    const nuevo = {
      id: Date.now(),
      numeroPedido,
      minoristaId,
      fecha: HOY,
      productos: items.map((i) => ({ productoId: i.id, cantidad: i.cantidad })),
      estado: 'confirmado',
      bodegaAsignada: bodega.id,
      total,
    }

    setInventario((prev) => restarInventario(prev, items, bodega.id))
    setPedidos((prev) => [nuevo, ...prev])
    return { ...nuevo, bodegaNombre: bodega.nombre }
  }

  // Aprobar reabastecimiento: SUMA stock (nivelMinimo * 2) a la bodega.
  const aprobarReabastecimiento = (productoId, bodegaId) => {
    setInventario((prev) =>
      prev.map((e) =>
        e.productoId === productoId && e.bodegaId === bodegaId
          ? { ...e, cantidad: e.cantidad + e.nivelMinimo * 2 }
          : e,
      ),
    )
    setEstadoAlertas((prev) => ({ ...prev, [`${productoId}-${bodegaId}`]: 'procesada' }))
  }

  const rechazarAlerta = (productoId, bodegaId) => {
    setEstadoAlertas((prev) => ({ ...prev, [`${productoId}-${bodegaId}`]: 'rechazada' }))
  }

  // Alertas derivadas del inventario (stock bajo o crítico).
  const alertas = useMemo(
    () =>
      inventario
        .filter((i) => i.cantidad < i.nivelMinimo)
        .map((i) => ({
          id: `${i.productoId}-${i.bodegaId}`,
          productoId: i.productoId,
          bodegaId: i.bodegaId,
          cantidad: i.cantidad,
          nivelMinimo: i.nivelMinimo,
          estado: estadoAlertas[`${i.productoId}-${i.bodegaId}`] ?? 'pendiente',
        }))
        .sort((a, b) => a.cantidad / a.nivelMinimo - b.cantidad / b.nivelMinimo),
    [inventario, estadoAlertas],
  )

  // KPIs CALCULADOS desde los datos (no hardcodeados).
  const metricas = useMemo(
    () => ({
      totalSKUs: productos.length,
      totalUnidades: inventario.reduce((s, i) => s + i.cantidad, 0),
      bodegasActivas: bodegas.filter((b) => b.estado === 'activa').length,
      totalBodegas: bodegas.length,
      alertasPendientes: alertas.filter((a) => a.estado === 'pendiente').length,
      procesadasHoy: Object.values(estadoAlertas).filter((v) => v === 'procesada').length,
      ventasTotales: pedidos.reduce((s, p) => s + p.total, 0),
      totalPedidos: pedidos.length,
    }),
    [inventario, pedidos, alertas, estadoAlertas],
  )

  const value = {
    inventario,
    pedidos,
    alertas,
    metricas,
    confirmarPedido,
    aprobarReabastecimiento,
    rechazarAlerta,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData debe usarse dentro de <DataProvider>')
  return ctx
}
