import { useNavigate } from 'react-router-dom'
import { Store, Boxes, LayoutDashboard, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth, ROLE_ROUTES } from '../context/AuthContext.jsx'
import Button from '../components/Button.jsx'
import logo from '../assets/chando-logo.svg'

const ROLES = [
  {
    rol: 'minorista',
    titulo: 'Soy Minorista',
    descripcion:
      'Realiza pedidos en línea, consulta el catálogo y aprovecha las campañas de marketing de CHANDO.',
    icon: Store,
  },
  {
    rol: 'operador',
    titulo: 'Soy Operador de Inventario',
    descripcion:
      'Gestiona el stock consolidado, las 14 bodegas centrales y el despacho de pedidos.',
    icon: Boxes,
  },
  {
    rol: 'ejecutivo',
    titulo: 'Soy Ejecutivo CHANDO',
    descripcion:
      'Analiza KPIs, ventas por región y los resultados de la transformación digital.',
    icon: LayoutDashboard,
  },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleIngresar = (rol) => {
    login(rol)
    navigate(ROLE_ROUTES[rol])
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-light px-4 py-12">
      {/* Encabezado con logo */}
      <header className="mb-10 flex flex-col items-center text-center">
        <img src={logo} alt="CHANDO" className="h-16 w-16" />
        <h1 className="mt-4 text-3xl font-bold tracking-[0.25em] text-dark">CHANDO</h1>
        <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-light/40 px-4 py-1.5 text-sm font-medium text-primary-dark">
          <Sparkles size={16} /> Plataforma Digital de Marketing
        </span>
        <p className="mt-4 max-w-md text-gray-500">
          Selecciona tu perfil para ingresar a la plataforma de transformación digital
          del canal.
        </p>
      </header>

      {/* Tarjetas de rol */}
      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {ROLES.map(({ rol, titulo, descripcion, icon: Icon }) => (
          <div
            key={rol}
            className="group flex flex-col items-center rounded-2xl border border-primary-light/40 bg-white p-8 text-center shadow-soft transition-all hover:-translate-y-1 hover:border-primary"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-light/40 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <Icon size={36} />
            </div>
            <h2 className="mt-6 text-xl font-bold text-dark">{titulo}</h2>
            <p className="mt-3 flex-1 text-sm text-gray-500">{descripcion}</p>
            <Button
              size="lg"
              className="mt-8 w-full"
              onClick={() => handleIngresar(rol)}
            >
              Ingresar
              <ArrowRight size={18} />
            </Button>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-gray-400">
        Acceso de demostración · No requiere contraseña · © 2026 CHANDO Cosméticos
      </p>
    </div>
  )
}
