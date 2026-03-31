import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '@/hooks/useApi'

export default function SettingsPage() {
  const { user, logout } = useAuth()

  // Profile
  const [profileName, setProfileName] = useState(user?.name ?? '')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  // Preferences
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [language, setLanguage] = useState('pt-BR')

  // Integrations status (placeholder)
  const [clickupConnected] = useState(false)
  const [metaAdsConnected] = useState(false)
  const [googleAdsConnected] = useState(false)

  const saveProfile = async () => {
    setProfileSaving(true)
    setProfileMsg('')
    try {
      await api.put('/api/v1/auth/profile', {
        name: profileName,
        avatarUrl: avatarUrl || undefined,
      })
      setProfileMsg('Perfil atualizado com sucesso!')
      setTimeout(() => setProfileMsg(''), 3000)
    } catch (e) {
      setProfileMsg('Erro ao atualizar perfil.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleExport = async () => {
    try {
      const data = await api.get('/api/v1/settings/export')
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'paiol-social-export.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Erro ao exportar dados:', e)
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        await api.post('/api/v1/settings/import', data)
        alert('Dados importados com sucesso!')
      } catch (err) {
        console.error('Erro ao importar:', err)
        alert('Erro ao importar dados.')
      }
    }
    input.click()
  }

  const sectionStyle = { marginBottom: 24 }
  const sectionTitleStyle = { fontSize: 18, fontWeight: 600 as const, marginBottom: 16 }
  const fieldRowStyle = { marginBottom: 14 }
  const labelStyle = { fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' as const }

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Configuracoes</h1>

      {/* Perfil */}
      <div className="glass-card" style={{ padding: 24, ...sectionStyle }}>
        <h2 style={sectionTitleStyle}>Perfil</h2>
        <div style={fieldRowStyle}>
          <label style={labelStyle}>Nome</label>
          <input
            type="text"
            className="glass-input"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
          />
        </div>
        <div style={fieldRowStyle}>
          <label style={labelStyle}>Email</label>
          <input
            type="text"
            className="glass-input"
            value={user?.email ?? ''}
            readOnly
            style={{ opacity: 0.6, cursor: 'not-allowed' }}
          />
        </div>
        <div style={fieldRowStyle}>
          <label style={labelStyle}>URL do Avatar</label>
          <input
            type="text"
            className="glass-input"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="glass-button" onClick={saveProfile} disabled={profileSaving}>
            {profileSaving ? 'Salvando...' : 'Salvar Perfil'}
          </button>
          {profileMsg && (
            <span style={{ fontSize: 13, color: profileMsg.includes('sucesso') ? 'var(--accent)' : 'var(--danger)' }}>
              {profileMsg}
            </span>
          )}
        </div>
      </div>

      {/* Integracoes */}
      <div className="glass-card" style={{ padding: 24, ...sectionStyle }}>
        <h2 style={sectionTitleStyle}>Integracoes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* ClickUp */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>ClickUp</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Gestao de tarefas e projetos</div>
            </div>
            <span className={`badge ${clickupConnected ? 'success' : 'warning'}`}>
              {clickupConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          {/* Meta Ads */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Meta Ads</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Facebook e Instagram Ads</div>
            </div>
            <span className={`badge ${metaAdsConnected ? 'success' : 'warning'}`}>
              {metaAdsConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          {/* Google Ads */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Google Ads</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Campanhas de pesquisa e display</div>
            </div>
            <span className={`badge ${googleAdsConnected ? 'success' : 'warning'}`}>
              {googleAdsConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
      </div>

      {/* Preferencias */}
      <div className="glass-card" style={{ padding: 24, ...sectionStyle }}>
        <h2 style={sectionTitleStyle}>Preferencias</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Tema</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className={`glass-button ${theme === 'dark' ? '' : 'secondary'}`}
                style={{ padding: '8px 16px', fontSize: 13 }}
                onClick={() => setTheme('dark')}
              >
                Escuro
              </button>
              <button
                className={`glass-button ${theme === 'light' ? '' : 'secondary'}`}
                style={{ padding: '8px 16px', fontSize: 13 }}
                onClick={() => setTheme('light')}
              >
                Claro
              </button>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Idioma</label>
            <select className="glass-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="pt-BR">Portugues (BR)</option>
              <option value="en">English</option>
              <option value="es">Espanol</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dados */}
      <div className="glass-card" style={{ padding: 24, ...sectionStyle }}>
        <h2 style={sectionTitleStyle}>Dados</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="glass-button secondary" onClick={handleExport}>
            Exportar Dados
          </button>
          <button className="glass-button secondary" onClick={handleImport}>
            Importar Dados
          </button>
        </div>
      </div>

      {/* Logout */}
      <div style={{ marginTop: 8 }}>
        <button className="glass-button danger" onClick={logout}>
          Sair da Conta
        </button>
      </div>
    </div>
  )
}
