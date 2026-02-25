import React, { CSSProperties, AnchorHTMLAttributes } from 'react'
import NextLink from 'next/link'

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  variant?: 'primary' | 'secondary' | 'ghost'
  style?: CSSProperties
}

export const Link: React.FC<LinkProps> = ({
  href,
  children,
  variant = 'primary',
  style,
  className = '',
  ...props
}) => {
  const baseStyles: CSSProperties = {
    color: variant === 'ghost' ? 'var(--accent-color, #0070f3)' : 'var(--text-primary, #333)',
    textDecoration: 'none',
    transition: 'opacity 0.2s',
    ...style,
  }

  return (
    <NextLink href={href} legacyBehavior>
      <a
        className={className}
        style={baseStyles}
        {...props}
      >
        {children}
      </a>
    </NextLink>
  )
}
