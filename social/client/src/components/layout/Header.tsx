import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface HeaderProps {
  onToggleSidebar: () => void
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/posts': 'Posts',
  '/calendar': 'Calendario',
  '/analytics': 'Analytics',
  '/accounts': 'Contas',
  '/clients': 'Clientes',
  '/competitors': 'Concorrentes',
  '/campaigns': 'Campanhas',
  '/settings': 'Configuracoes',
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const location = useLocation()
  const { user } = useAuth()

  const title = pageTitles[location.pathname] || 'Paiol Social'

  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--glass-border)',
      }}
    >
      <div className="flex items-center gap-4">
        {/* Hamburger - mobile only */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors relative">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: 'var(--accent)' }}
          />
        </button>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--accent)' }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-sm hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
            {user?.name || 'Usuario'}
          </span>
        </div>
      </div>
    </header>
  )
}
