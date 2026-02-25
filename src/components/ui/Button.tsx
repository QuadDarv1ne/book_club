import React, { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 500,
      borderRadius: 6,
      border: 'none',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.6 : 1,
      transition: 'all 0.2s',
      width: fullWidth ? '100%' : 'auto',
      padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 24px' : '8px 16px',
      fontSize: size === 'sm' ? '14px' : size === 'lg' ? '18px' : '16px',
    }

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: 'var(--accent-color, #0070f3)',
        color: 'white',
      },
      secondary: {
        backgroundColor: 'var(--bg-secondary, #eaeaea)',
        color: 'var(--text-primary, #333)',
        border: '1px solid var(--border-color, #ccc)',
      },
      danger: {
        backgroundColor: 'var(--danger-color, #dc3545)',
        color: 'white',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--accent-color, #0070f3)',
      },
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={className}
        style={{ ...baseStyles, ...variantStyles[variant], ...style }}
        {...props}
      >
        {isLoading && (
          <span
            style={{
              display: 'inline-block',
              width: '16px',
              height: '16px',
              border: '2px solid currentColor',
              borderRightColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.75s linear infinite',
              marginRight: children ? '8px' : '0',
            }}
          />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
