'use client'

import { useState, useEffect } from 'react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const initialDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    setIsDark(initialDark)
    document.documentElement.setAttribute('data-theme', initialDark ? 'dark' : 'light')
  }, [])

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', newDark ? 'dark' : 'light')
  }

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: 'transparent',
        border: '1px solid var(--border-color)',
        borderRadius: 6,
        padding: '8px 12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 14,
        color: 'var(--text-primary)',
        transition: 'all 0.2s'
      }}
      title={isDark ? 'Светлая тема' : 'Тёмная тема'}
      type="button"
    >
      <span style={{ fontSize: 16 }}>
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
