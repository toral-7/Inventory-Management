import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  // Size mapping
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  useEffect(() => {
    if (!isOpen) return;

    // Focus trap: move focus to modal
    if (firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }

    // Handle Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={`bg-clickhouse-surface-card border border-clickhouse-hairline rounded-lg shadow-lg max-h-[90vh] overflow-y-auto ${sizeClasses[size]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-lg border-b border-clickhouse-hairline">
          <h2 id="modal-title" className="text-lg font-bold text-clickhouse-ink">
            {title}
          </h2>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="p-2 hover:bg-clickhouse-surface-elevated rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-clickhouse-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="p-lg">
          {children}
        </div>

        {/* Last focusable element for focus trap */}
        <div
          ref={lastFocusableRef}
          tabIndex={0}
          className="invisible"
        />
      </div>
    </div>
  );
}