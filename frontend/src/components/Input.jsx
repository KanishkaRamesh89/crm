export default function Input({
  label,
  error,
  className = '',
  as = 'input',
  children,
  leftIcon,
  rightSlot,
  wrapperClassName = '',
  ...props
}) {
  const baseClasses =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
  const paddingClasses = [
    leftIcon ? 'pl-10' : '',
    rightSlot ? 'pr-10' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const field = as === 'textarea' ? (
    <textarea className={`${baseClasses} min-h-[120px] ${paddingClasses} ${className}`} {...props} />
  ) : as === 'select' ? (
    <select className={`${baseClasses} ${paddingClasses} ${className}`} {...props}>
      {children}
    </select>
  ) : (
    <input className={`${baseClasses} ${paddingClasses} ${className}`} {...props} />
  )

  return (
    <label className={`block ${wrapperClassName}`}>
      {label ? (
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {label}
        </span>
      ) : null}
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            {leftIcon}
          </span>
        ) : null}
        {field}
        {rightSlot ? (
          <span className="absolute inset-y-0 right-3 flex items-center">
            {rightSlot}
          </span>
        ) : null}
      </div>
      {error ? <span className="mt-2 block text-sm text-rose-600">{error}</span> : null}
    </label>
  )
}
