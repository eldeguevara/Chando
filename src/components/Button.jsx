const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-soft',
  secondary: 'bg-secondary text-dark hover:bg-secondary-light',
  outline: 'border border-primary text-primary hover:bg-primary-light/30',
  ghost: 'text-dark hover:bg-primary-light/30',
  dark: 'bg-dark text-white hover:bg-dark/90',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'

  return (
    <button
      type={type}
      className={`${base} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
