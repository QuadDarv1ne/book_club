import React, { CSSProperties } from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  style?: CSSProperties
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  style,
  className = '',
}) => {
  const baseStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    borderRadius: 9999,
    padding: size === 'sm' ? '2px 8px' : '4px 12px',
    fontSize: size === 'sm' ? '12px' : '14px',
    ...style,
  }

  const variantStyles: Record<string, CSSProperties> = {
    default: {
      backgroundColor: 'var(--bg-secondary, #eaeaea)',
      color: 'var(--text-primary, #333)',
    },
    primary: {
      backgroundColor: 'var(--accent-color, #0070f3)',
      color: 'white',
    },
    secondary: {
      backgroundColor: 'var(--bg-secondary, #eaeaea)',
      color: 'var(--text-secondary, #666)',
      border: '1px solid var(--border-color, #ccc)',
    },
    success: {
      backgroundColor: 'var(--success-color, #28a745)',
      color: 'white',
    },
    warning: {
      backgroundColor: '#ffc107',
      color: '#333',
    },
    danger: {
      backgroundColor: 'var(--danger-color, #dc3545)',
      color: 'white',
    },
  }

  return (
    <span className={className} style={{ ...baseStyles, ...variantStyles[variant] }}>
      {children}
    </span>
  )
}
