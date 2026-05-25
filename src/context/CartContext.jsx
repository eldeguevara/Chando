import { createContext, useContext, useMemo, useState } from 'react'
import productos from '../data/productos.json'

// Carrito del minorista (solo estado de UI). La confirmación del pedido y
// el descuento de inventario viven en DataContext.
const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState({}) // { [productoId]: cantidad }

  const agregar = (id) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }))

  const cambiarCantidad = (id, delta) =>
    setCart((c) => {
      const siguiente = (c[id] ?? 0) + delta
      if (siguiente <= 0) {
        const copia = { ...c }
        delete copia[id]
        return copia
      }
      return { ...c, [id]: siguiente }
    })

  const quitar = (id) =>
    setCart((c) => {
      const copia = { ...c }
      delete copia[id]
      return copia
    })

  const vaciar = () => setCart({})

  const items = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, cantidad]) => {
          const producto = productos.find((p) => p.id === Number(id))
          if (!producto) return null
          return { ...producto, cantidad, subtotal: producto.precio * cantidad }
        })
        .filter(Boolean),
    [cart],
  )

  const totalItems = items.reduce((s, i) => s + i.cantidad, 0)
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0)

  const value = { cart, items, totalItems, subtotal, agregar, cambiarCantidad, quitar, vaciar }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
