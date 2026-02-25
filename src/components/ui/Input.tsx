import React, { InputHTMLAttributes, forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, className = '', style, ...props }, ref) => {
    const baseStyles: React.CSSProperties = {
      display: 'block',
      padding: '10px 12px',
      fontSize: '16px',
      borderRadius: 6,
      border: '1px solid var(--border-color, #ccc)',
      width: fullWidth ? '100%' : 'auto',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s',
      backgroundColor: 'var(--bg-primary, #fff)',
      color: 'var(--text-primary, #333)',
    }

    const errorStyles: React.CSSProperties = error
      ? { borderColor: 'var(--danger-color, #dc3545)', backgroundColor: '#fff5f5' }
      : {}

    return (
      <div style={{ marginBottom: '16px', width: fullWidth ? '100%' : 'auto' }}>
        {label && (
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: 500,
              fontSize: '14px',
              color: 'var(--text-primary, #333)',
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={className}
          style={{ ...baseStyles, ...errorStyles, ...style }}
          {...props}
        />
        {error && (
          <span
            style={{
              display: 'block',
              marginTop: '4px',
              fontSize: '12px',
              color: 'var(--danger-color, #dc3545)',
            }}
          >
            {error}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
