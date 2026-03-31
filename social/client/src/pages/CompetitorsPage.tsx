import React, { useState, useEffect, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import api from '@/hooks/useApi'
import PlatformIcon from '@/components/ui/PlatformIcon'

interface Competitor {
  id: string
  platform: string
  username: string
  latestFollowers?: number
  engagementRate?: number
  avgLikes?: number
  followerHistory?: { date: string; followers: number }[]
}

interface OwnAccount {
  id: string
  platform: string
  username: string
}

const PLATFORMS = ['instagram', 'facebook', 'twitter', 'tiktok', 'linkedin', 'youtube']

const LINE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#E4405F', '#8b5cf6', '#00F2EA']

const tooltipStyle = {
  background: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  color: '#fff',
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [accounts, setAccounts] = useState<OwnAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [newPlatform, setNewPlatform] = useState('instagram')
  const [newUsername, setNewUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [compareAccountId, setCompareAccountId] = useState('')

  const fetchCompetitors = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/competitors')
      setCompetitors(res.competitors ?? res ?? [])
    } catch (e) {
      console.error('Erro ao carregar concorrentes:', e)
    }
  }, [])

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/accounts')
      setAccounts(res.accounts ?? res ?? [])
    } catch (e) {
      console.error('Erro ao carregar contas:', e)
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchCompetitors(), fetchAccounts()]).finally(() => setLoading(false))
  }, [fetchCompetitors, fetchAccounts])

  const addCompetitor = async () => {
    if (!newPlatform || !newUsername.trim()) return
    setSaving(true)
    try {
      await api.post('/api/v1/competitors', { platform: newPlatform, username: newUsername.trim() })
      setModalOpen(false)
      setNewUsername('')
      fetchCompetitors()
    } catch (e) {
      console.error('Erro ao adicionar concorrente:', e)
    } finally {
      setSaving(false)
    }
  }

  const removeCompetitor = async (id: string) => {
    if (!window.confirm('Remover este concorrente?')) return
    try {
      await api.del(`/api/v1/competitors/${id}`)
      setCompareIds((prev) => prev.filter((x) => x !== id))
      fetchCompetitors()
    } catch (e) {
      console.error('Erro ao remover concorrente:', e)
    }
  }

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const formatNumber = (n?: number) => {
    if (n == null) return '-'
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toString()
  }

  // Build comparison chart data
  const comparedCompetitors = competitors.filter((c) => compareIds.includes(c.id))
  const buildComparisonData = () => {
    const allDates = new Set<string>()
    comparedCompetitors.forEach((c) => {
      c.followerHistory?.forEach((h) => allDates.add(h.date))
    })
    const dates = Array.from(allDates).sort()
    return dates.map((date) => {
      const point: Record<string, any> = { date }
      comparedCompetitors.forEach((c) => {
        const entry = c.followerHistory?.find((h) => h.date === date)
        point[c.username] = entry?.followers ?? null
      })
      return point
    })
  }

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
        Carregando concorrentes...
      </div>
    )
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Analise de Concorrentes</h1>
        <button className="glass-button" onClick={() => setModalOpen(true)}>+ Adicionar Concorrente</button>
      </div>

      {competitors.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Nenhum concorrente adicionado. Clique em "Adicionar Concorrente" para monitorar.
        </div>
      ) : (
        <>
          {/* Competitor Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 32 }}>
            {competitors.map((comp) => (
              <div key={comp.id} className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <PlatformIcon platform={comp.platform} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>@{comp.username}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{comp.platform}</div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={compareIds.includes(comp.id)}
                      onChange={() => toggleCompare(comp.id)}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    Comparar
                  </label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Seguidores</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{formatNumber(comp.latestFollowers)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Taxa de Engajamento</span>
                    <span style={{ color: 'var(--warning)' }}>{comp.engagementRate != null ? `${comp.engagementRate.toFixed(1)}%` : '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Media de Curtidas</span>
                    <span>{formatNumber(comp.avgLikes)}</span>
                  </div>
                </div>

                <button
                  className="glass-button danger"
                  style={{ width: '100%', padding: '8px', fontSize: 12, justifyContent: 'center' }}
                  onClick={() => removeCompetitor(comp.id)}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>

          {/* Comparison Section */}
          {compareIds.length >= 2 && (
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600 }}>Comparacao de Crescimento de Seguidores</h3>
                {accounts.length > 0 && (
                  <select
                    className="glass-input"
                    style={{ width: 200 }}
                    value={compareAccountId}
                    onChange={(e) => setCompareAccountId(e.target.value)}
                  >
                    <option value="">Sua conta (opcional)</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>@{a.username} ({a.platform})</option>
                    ))}
                  </select>
                )}
              </div>
              {(() => {
                const data = buildComparisonData()
                if (data.length === 0) {
                  return (
                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 40, fontSize: 14 }}>
                      Dados historicos insuficientes para comparacao.
                    </div>
                  )
                }
                return (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={data}>
                      <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                      <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                      {comparedCompetitors.map((c, i) => (
                        <Line
                          key={c.id}
                          type="monotone"
                          dataKey={c.username}
                          stroke={LINE_COLORS[i % LINE_COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                          name={`@${c.username}`}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )
              })()}
            </div>
          )}
        </>
      )}

      {/* Add Competitor Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>Adicionar Concorrente</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 20, cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Plataforma</label>
              <select className="glass-input" value={newPlatform} onChange={(e) => setNewPlatform(e.target.value)}>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p} style={{ textTransform: 'capitalize' }}>{p}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Nome de usuario</label>
              <input
                type="text"
                className="glass-input"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="@usuario_concorrente"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="glass-button secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button
                className="glass-button"
                onClick={addCompetitor}
                disabled={saving || !newUsername.trim()}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
