import React, { useState, useEffect, useCallback } from 'react'
import api from '@/hooks/useApi'
import PlatformIcon from '@/components/ui/PlatformIcon'

interface Account {
  id: string
  platform: string
  username: string
  displayName?: string
  clientId?: string
  clientName?: string
  followers?: number
  connectedAt?: string
}

interface Client {
  id: string
  name: string
}

const ALL_PLATFORMS = ['instagram', 'facebook', 'twitter', 'tiktok', 'linkedin', 'youtube', 'pinterest', 'threads']

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [newPlatform, setNewPlatform] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [newDisplayName, setNewDisplayName] = useState('')
  const [newClientId, setNewClientId] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/accounts')
      setAccounts(res.accounts ?? res ?? [])
    } catch (e) {
      console.error('Erro ao carregar contas:', e)
    }
  }, [])

  const fetchClients = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/clients')
      setClients(res.clients ?? res ?? [])
    } catch (e) {
      console.error('Erro ao carregar clientes:', e)
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchAccounts(), fetchClients()]).finally(() => setLoading(false))
  }, [fetchAccounts, fetchClients])

  const connectAccount = async () => {
    if (!newPlatform || !newUsername) return
    setSaving(true)
    try {
      await api.post('/api/v1/accounts', {
        platform: newPlatform,
        username: newUsername,
        displayName: newDisplayName || undefined,
        clientId: newClientId || undefined,
      })
      setModalOpen(false)
      setNewPlatform('')
      setNewUsername('')
      setNewDisplayName('')
      setNewClientId('')
      fetchAccounts()
    } catch (e) {
      console.error('Erro ao conectar conta:', e)
    } finally {
      setSaving(false)
    }
  }

  const disconnectAccount = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja desconectar esta conta?')) return
    try {
      await api.del(`/api/v1/accounts/${id}`)
      fetchAccounts()
    } catch (e) {
      console.error('Erro ao desconectar:', e)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
        Carregando contas...
      </div>
    )
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Contas Conectadas</h1>
        <button className="glass-button" onClick={() => setModalOpen(true)}>+ Conectar Conta</button>
      </div>

      {accounts.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Nenhuma conta conectada. Clique em "Conectar Conta" para adicionar.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {accounts.map((account) => (
            <div key={account.id} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <PlatformIcon platform={account.platform} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {account.displayName || account.username}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    @{account.username}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Plataforma</span>
                  <span style={{ textTransform: 'capitalize' }}>{account.platform}</span>
                </div>
                {account.clientName && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Cliente</span>
                    <span>{account.clientName}</span>
                  </div>
                )}
                {account.followers != null && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Seguidores</span>
                    <span style={{ color: 'var(--accent)' }}>{account.followers.toLocaleString('pt-BR')}</span>
                  </div>
                )}
                {account.connectedAt && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Conectado em</span>
                    <span>{new Date(account.connectedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>

              <button
                className="glass-button danger"
                style={{ width: '100%', padding: '8px', fontSize: 13, justifyContent: 'center' }}
                onClick={() => disconnectAccount(account.id)}
              >
                Desconectar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Connect Account Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>Conectar Conta</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 20, cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            {/* Platform Selector */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Selecione a Plataforma</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {ALL_PLATFORMS.map((p) => (
                  <div
                    key={p}
                    onClick={() => setNewPlatform(p)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      padding: 12,
                      borderRadius: 12,
                      cursor: 'pointer',
                      background: newPlatform === p ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${newPlatform === p ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    <PlatformIcon platform={p} size={28} />
                    <span style={{ fontSize: 11, textTransform: 'capitalize', color: newPlatform === p ? 'var(--accent)' : 'var(--text-secondary)' }}>
                      {p}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Username */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Nome de usuario</label>
              <input
                type="text"
                className="glass-input"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="@usuario"
              />
            </div>

            {/* Display Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Nome de exibicao</label>
              <input
                type="text"
                className="glass-input"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="Nome visivel"
              />
            </div>

            {/* Client */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Cliente</label>
              <select className="glass-input" value={newClientId} onChange={(e) => setNewClientId(e.target.value)}>
                <option value="">Selecione um cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="glass-button secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button
                className="glass-button"
                onClick={connectAccount}
                disabled={saving || !newPlatform || !newUsername}
              >
                Conectar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
