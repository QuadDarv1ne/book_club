import React, { CSSProperties } from 'react'
import Image from 'next/image'

export interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  style?: CSSProperties
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  style,
  className = '',
}) => {
  const sizeMap = {
    sm: '32px',
    md: '40px',
    lg: '48px',
    xl: '64px',
  }

  const containerStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizeMap[size],
    height: sizeMap[size],
    borderRadius: '50%',
    backgroundColor: 'var(--accent-color, #0070f3)',
    color: 'white',
    fontWeight: 600,
    fontSize: size === 'sm' ? '12px' : size === 'xl' ? '24px' : '16px',
    overflow: 'hidden',
    ...style,
  }

  const getInitials = (name?: string) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
      const first = parts[0]?.charAt(0) || ''
      const last = parts[parts.length - 1]?.charAt(0) || ''
      return `${first}${last}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  if (src) {
    return (
      <div className={className} style={{ ...containerStyles, position: 'relative' }}>
        <Image src={src} alt={alt} fill style={{ objectFit: 'cover' }} />
      </div>
    )
  }

  return (
    <div className={className} style={containerStyles}>
      {getInitials(name)}
    </div>
  )
}
