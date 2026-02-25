import React, { CSSProperties, ReactNode, useEffect } from 'react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeMap = {
    sm: '400px',
    md: '500px',
    lg: '700px',
  }

  const overlayStyles: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  }

  const modalStyles: CSSProperties = {
    backgroundColor: 'var(--card-bg, #fff)',
    borderRadius: 8,
    maxWidth: sizeMap[size],
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  }

  const headerStyles: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color, #eaeaea)',
  }

  const titleStyles: CSSProperties = {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text-primary, #333)',
  }

  const closeButtonStyles: CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: 'var(--text-secondary, #666)',
    padding: 0,
    lineHeight: 1,
  }

  const contentStyles: CSSProperties = {
    padding: '20px',
  }

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        {(title || true) && (
          <div style={headerStyles}>
            {title && <h2 style={titleStyles}>{title}</h2>}
            {onClose && (
              <button style={closeButtonStyles} onClick={onClose}>
                ×
              </button>
            )}
          </div>
        )}
        <div style={contentStyles}>{children}</div>
      </div>
    </div>
  )
}
