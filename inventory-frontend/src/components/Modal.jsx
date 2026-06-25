import React from 'react'

export default function Modal({ isOpen, title, onClose, children, size = 'md' }) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
      <div className={`
        bg-card border border-dark rounded-xl shadow-dark-xl
        p-6 ${sizeClasses[size]} w-full mx-4
        animate-scale-in
        max-h-[90vh] overflow-y-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-dark pb-4">
          <h2 className="text-xl font-bold text-light gradient-text">{title}</h2>
          <button
            onClick={onClose}
            className="
              p-1.5 hover:bg-dark rounded-lg
              text-text-secondary hover:text-accent-emerald
              transition-colors
            "
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="text-light">
          {children}
        </div>
      </div>
    </div>
  )
}