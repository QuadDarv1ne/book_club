import React, { CSSProperties } from 'react'

export interface AlertProps {
  children: React.ReactNode
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  onClose?: () => void
  style?: CSSProperties
  className?: string
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  onClose,
  style,
  className = '',
}) => {
  const baseStyles: CSSProperties = {
    padding: '12px 16px',
    borderRadius: 6,
    marginBottom: '16px',
    ...style,
  }

  const variantStyles: Record<string, CSSProperties> = {
    info: {
      backgroundColor: '#e7f3ff',
      color: '#084298',
      border: '1px solid #b6d4fe',
    },
    success: {
      backgroundColor: '#d1e7dd',
      color: '#0f5132',
      border: '1px solid #badbcc',
    },
    warning: {
      backgroundColor: '#fff3cd',
      color: '#664d03',
      border: '1px solid #ffecb5',
    },
    error: {
      backgroundColor: '#f8d7da',
      color: '#842029',
      border: '1px solid #f5c2c7',
    },
  }

  return (
    <div className={className} style={{ ...baseStyles, ...variantStyles[variant] }}>
      {title && (
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{title}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <span style={{ flex: 1 }}>{children}</span>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              lineHeight: 1,
              padding: 0,
              opacity: 0.5,
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
