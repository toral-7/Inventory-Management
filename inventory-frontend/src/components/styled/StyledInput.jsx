import React from 'react'

export default function StyledInput({
  label,
  error,
  icon: Icon = null,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-clickhouse-ink mb-2">
          {label}
          {props.required && <span className="text-clickhouse-rose ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-clickhouse-muted flex items-center pointer-events-none">
            {Icon}
          </div>
        )}
        
        <input
          className={`
            w-full
            bg-clickhouse-surface-card 
            border border-clickhouse-hairline 
            rounded-md
            ${Icon ? 'pl-10 pr-3' : 'px-3'} py-2.5
            text-clickhouse-ink 
            placeholder-clickhouse-muted
            focus:outline-none 
            focus:border-clickhouse-yellow 
            focus:bg-clickhouse-surface-elevated
            transition-all duration-200
            ${error ? 'border-clickhouse-rose' : ''}
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="text-clickhouse-rose text-xs mt-1.5 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  )
}