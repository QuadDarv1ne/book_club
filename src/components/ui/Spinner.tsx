import React, { CSSProperties } from 'react'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  style?: CSSProperties
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color,
  style,
  className = '',
}) => {
  const sizeMap = {
    sm: '16px',
    md: '24px',
    lg: '32px',
  }

  const spinnerStyles: CSSProperties = {
    display: 'inline-block',
    width: sizeMap[size],
    height: sizeMap[size],
    border: `2px solid ${color || 'currentColor'}`,
    borderRightColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.75s linear infinite',
    ...style,
  }

  return <span className={className} style={spinnerStyles} />
}
