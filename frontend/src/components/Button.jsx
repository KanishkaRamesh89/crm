export default function Button({
  as: Component = 'button',
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  leftIcon,
  rightIcon,
  fullWidth = false,
  type = 'button',
  ...props
}) {
  const variants = {
    primary:
      'bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-600',
    secondary:
      'bg-blue-50 text-blue-700 hover:bg-blue-100 focus-visible:ring-blue-500',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600',
  }

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
  }

  return (
    <Component
      type={Component === 'button' ? type : undefined}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </Component>
  )
}
