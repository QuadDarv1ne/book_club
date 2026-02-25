import React, { CSSProperties, ReactNode } from 'react'

export interface ContainerProps {
  children: ReactNode
  maxWidth?: CSSProperties['maxWidth']
  padding?: CSSProperties['padding']
  style?: CSSProperties
  className?: string
}

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = '1200px',
  padding = '20px',
  style,
  className = '',
}) => {
  const containerStyles: CSSProperties = {
    maxWidth,
    margin: '0 auto',
    padding,
    width: '100%',
    boxSizing: 'border-box',
    ...style,
  }

  return (
    <div className={className} style={containerStyles}>
      {children}
    </div>
  )
}
