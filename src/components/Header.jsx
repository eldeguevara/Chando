import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import logo from '../assets/chando-logo.svg'

// Header reutilizable: logo (izq) · título (centro) · usuario + logout (der).
//
// Props:
//   titulo   -> título de la página (centro)
//   usuario  -> { nombre, sub }
//   acciones -> nodo opcional (ej. selector de rango de fechas)
export default function Header({ titulo, usuario, acciones }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const cerrarSesion = () => {
    logout()
    navigate('/')
  }

  const inicial = usuario?.nombre?.charAt(0)?.toUpperCase() ?? 'U'

  return (
    <header className="z-10 flex items-center gap-3 border-b border-primary-light/30 bg-white px-3 py-3 lg:px-6">
      {/* Izquierda: logo (alineado con el ancho del sidebar) */}
      <div className="flex w-16 shrink-0 items-center gap-2 sm:w-20 md:w-60">
        <img src={logo} alt="CHANDO" className="h-9 w-9" />
        <span className="hidden text-lg font-bold tracking-[0.2em] text-dark md:inline">
          CHANDO
        </span>
      </div>

      {/* Centro: título */}
      <h1 className="flex-1 truncate text-center text-sm font-bold text-dark sm:text-base lg:text-lg">
        {titulo}
      </h1>

      {/* Derecha: acciones + usuario + logout */}
      <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
        {acciones}
        <div className="hidden text-right text-sm leading-tight lg:block">
          <p className="font-medium text-dark">{usuario?.nombre}</p>
          <p className="text-xs text-gray-500">{usuario?.sub}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {inicial}
        </div>
        <button
          onClick={cerrarSesion}
          title="Cerrar sesión"
          className="rounded-lg p-2 text-gray-500 transition-all duration-150 hover:bg-light hover:text-primary active:scale-95"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}
