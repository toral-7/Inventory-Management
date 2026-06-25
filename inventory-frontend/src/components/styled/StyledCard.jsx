import React from 'react'

export default function StyledCard({ 
  children, 
  className = '', 
  compact = false,
  ...props 
}) {
  const paddingClass = compact ? 'p-lg' : 'p-xl'
  
  return (
    <div
      className={`
        bg-clickhouse-surface-card 
        border border-clickhouse-hairline 
        rounded-lg
        ${paddingClass}
        transition-all duration-200
        hover:border-clickhouse-hairline-strong
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}