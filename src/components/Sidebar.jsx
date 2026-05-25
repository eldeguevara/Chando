// Sidebar reutilizable: recibe los items de menú y el item activo.
// Se usa en los tres módulos (minorista, operador, ejecutivo).
//
// Props:
//   rol      -> etiqueta del rol/módulo (ej. "Portal del Minorista")
//   items    -> [{ id, label, icon, badge?, badgeTone? }]
//   active   -> id del item activo
//   onSelect -> (id) => void
export default function Sidebar({ rol, items, active, onSelect }) {
  return (
    <aside className="flex w-16 shrink-0 flex-col border-r border-white/10 bg-dark text-white sm:w-20 md:w-60">
      <div className="px-3 py-4 md:px-5">
        <p className="hidden truncate text-[11px] font-semibold uppercase tracking-wider text-white/40 md:block">
          {rol}
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-2 md:px-3">
        {items.map(({ id, label, icon: Icon, badge, badgeTone }) => {
          const activo = active === id
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              title={label}
              className={`group relative flex w-full items-center justify-center gap-3 rounded-lg py-3 text-sm font-medium transition-all duration-200 md:justify-start md:px-4 ${
                activo
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={20} className="shrink-0 transition-transform group-hover:scale-110" />
              <span className="hidden flex-1 text-left md:inline">{label}</span>
              {badge > 0 && (
                <span
                  className={`absolute right-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold md:static md:px-2 md:text-xs ${
                    badgeTone === 'danger' ? 'bg-red-500 text-white' : 'bg-secondary text-dark'
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="px-3 py-4 text-center text-[10px] text-white/30 md:px-5 md:text-left">
        <span className="hidden md:inline">© 2026 CHANDO</span>
      </div>
    </aside>
  )
}
