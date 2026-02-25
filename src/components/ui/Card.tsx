import React, { CSSProperties, ReactNode } from 'react'

export interface CardProps {
  children: ReactNode
  title?: string
  description?: string
  padding?: CSSProperties['padding']
  style?: CSSProperties
  className?: string
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  description,
  padding = '20px',
  style,
  className = '',
}) => {
  const cardStyles: CSSProperties = {
    backgroundColor: 'var(--card-bg, #fff)',
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--border-color, #eaeaea)',
    overflow: 'hidden',
    ...style,
  }

  const headerStyles: CSSProperties = {
    padding,
    paddingBottom: description ? '10px' : padding,
    borderBottom: '1px solid var(--border-color, #eaeaea)',
  }

  const titleStyles: CSSProperties = {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text-primary, #333)',
  }

  const descriptionStyles: CSSProperties = {
    margin: '4px 0 0',
    fontSize: '14px',
    color: 'var(--text-secondary, #666)',
  }

  const contentStyles: CSSProperties = {
    padding,
  }

  return (
    <div className={className} style={cardStyles}>
      {(title || description) && (
        <div style={headerStyles}>
          {title && <h3 style={titleStyles}>{title}</h3>}
          {description && <p style={descriptionStyles}>{description}</p>}
        </div>
      )}
      <div style={contentStyles}>{children}</div>
    </div>
  )
}
