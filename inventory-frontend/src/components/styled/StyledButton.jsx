import React from 'react'

export default function StyledButton({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  loading = false,
  className = '',
  ...props
}) {
  const variantClasses = {
    primary: 'bg-clickhouse-yellow text-clickhouse-canvas hover:bg-clickhouse-yellow-active font-semibold',
    secondary: 'bg-clickhouse-surface-card text-clickhouse-ink border border-clickhouse-hairline hover:bg-clickhouse-surface-elevated hover:border-clickhouse-hairline-strong',
    danger: 'bg-clickhouse-rose text-white hover:opacity-90',
    text: 'bg-transparent text-clickhouse-ink hover:text-clickhouse-yellow',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 h-10 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-md font-semibold
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={loading}
      {...props}
    >
      {loading && <div className="spinner" />}
      {icon && !loading && icon}
      {children}
    </button>
  )
}