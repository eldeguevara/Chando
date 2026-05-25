import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Ruta de inicio asociada a cada rol del sistema
export const ROLE_ROUTES = {
  minorista: '/minorista',
  operador: '/inventario',
  ejecutivo: '/ejecutivo',
}

// Etiquetas legibles para mostrar en la interfaz
export const ROLE_LABELS = {
  minorista: 'Minorista',
  operador: 'Operador de Inventario',
  ejecutivo: 'Ejecutivo CHANDO',
}

export function AuthProvider({ children }) {
  // Estado del usuario actual: null o { rol }
  const [usuario, setUsuario] = useState(null)

  // Guarda el rol seleccionado al iniciar sesión
  const login = (rol) => setUsuario({ rol })

  // Limpia el estado al cerrar sesión
  const logout = () => setUsuario(null)

  const value = { usuario, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === null) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return ctx
}
