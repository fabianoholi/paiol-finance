import React, { useState, useEffect, useCallback } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import api from '@/hooks/useApi'
import PlatformIcon from '@/components/ui/PlatformIcon'

interface Account {
  id: string
  platform: string
  username: string
  displayName?: string
}

interface MetricData {
  followers: number
  reach: number
  impressions: number
  engagement: number
  likes: number
  comments: number
}

interface TimePoint {
  date: string
  followers?: number
  reach?: number
  impressions?: number
  likes?: number
  comments?: number
  shares?: number
}

interface TopPost {
  id: string
  content: string
  platform: string
  likes: number
  comments: number
  shares: number
  engagementRate: number
}

const RANGES = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
]

const tooltipStyle = {
  background: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  color: '#fff',
}

export default function AnalyticsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [range, setRange] = useState('30d')
  const [metrics, setMetrics] = useState<MetricData | null>(null)
  const [timeData, setTimeData] = useState<TimePoint[]>([])
  const [topPosts, setTopPosts] = useState<TopPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAccounts() {
      try {
        const res = await api.get('/api/v1/accounts')
        const accs = res.accounts ?? res ?? []
        setAccounts(accs)
        if (accs.length > 0) setSelectedAccountId(accs[0].id)
      } catch (e) {
        console.error('Erro ao carregar contas:', e)
      }
    }
    loadAccounts()
  }, [])

  const fetchAnalytics = useCallback(async () => {
    if (!selectedAccountId) { setLoading(false); return }
    setLoading(true)
    try {
      const [accountData, topPostsData] = await Promise.all([
        api.get(`/api/v1/analytics/account/${selectedAccountId}?range=${range}`),
        api.get(`/api/v1/analytics/top-posts?accountId=${selectedAccountId}&range=${range}`),
      ])
      setMetrics(accountData.metrics ?? {
        followers: accountData.followers ?? 0,
        reach: accountData.reach ?? 0,
        impressions: accountData.impressions ?? 0,
        engagement: accountData.engagement ?? 0,
        likes: accountData.likes ?? 0,
        comments: accountData.comments ?? 0,
      })
      setTimeData(accountData.timeSeries ?? accountData.data ?? [])
      setTopPosts(topPostsData.posts ?? topPostsData ?? [])
    } catch (e) {
      console.error('Erro ao carregar analytics:', e)
    } finally {
      setLoading(false)
    }
  }, [selectedAccountId, range])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const metricCards = [
    { label: 'Seguidores', value: metrics?.followers ?? 0, color: 'var(--purple)' },
    { label: 'Alcance', value: metrics?.reach ?? 0, color: 'var(--info)' },
    { label: 'Impressoes', value: metrics?.impressions ?? 0, color: 'var(--accent)' },
    { label: 'Engajamento', value: `${(metrics?.engagement ?? 0).toFixed(1)}%`, color: 'var(--warning)' },
    { label: 'Curtidas', value: metrics?.likes ?? 0, color: '#E4405F' },
    { label: 'Comentarios', value: metrics?.comments ?? 0, color: '#00F2EA' },
  ]

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toString()
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Analytics</h1>

      {/* Controls */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          className="glass-input"
          style={{ width: 220 }}
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
        >
          <option value="">Selecione uma conta</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.platform} - @{a.username}
            </option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 4 }}>
          {RANGES.map((r) => (
            <button
              key={r.value}
              className={`glass-button ${range === r.value ? '' : 'secondary'}`}
              style={{ padding: '8px 16px', fontSize: 13 }}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 48 }}>
          Carregando analytics...
        </div>
      ) : !selectedAccountId ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Selecione uma conta para ver as metricas.
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 32 }}>
            {metricCards.map((m) => (
              <div key={m.label} className="glass-card" style={{ padding: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: m.color }}>
                  {typeof m.value === 'number' ? formatNumber(m.value) : m.value}
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 24, marginBottom: 32 }}>
            {/* Followers Growth */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Crescimento de Seguidores</h3>
              {timeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={timeData}>
                    <defs>
                      <linearGradient id="followerGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="followers" stroke="#8b5cf6" fill="url(#followerGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 40, fontSize: 14 }}>Sem dados</div>
              )}
            </div>

            {/* Engagement */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Engajamento por Dia</h3>
              {timeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={timeData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                    <Bar dataKey="likes" fill="#E4405F" name="Curtidas" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="comments" fill="#00F2EA" name="Comentarios" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="shares" fill="#f59e0b" name="Compartilhamentos" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 40, fontSize: 14 }}>Sem dados</div>
              )}
            </div>

            {/* Reach / Impressions */}
            <div className="glass-card" style={{ padding: 24, gridColumn: '1 / -1' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Alcance e Impressoes</h3>
              {timeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={timeData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                    <Line type="monotone" dataKey="reach" stroke="#3b82f6" strokeWidth={2} dot={false} name="Alcance" />
                    <Line type="monotone" dataKey="impressions" stroke="#10b981" strokeWidth={2} dot={false} name="Impressoes" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 40, fontSize: 14 }}>Sem dados</div>
              )}
            </div>
          </div>

          {/* Top Posts Table */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Top Posts</h3>
            {topPosts.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24, fontSize: 14 }}>
                Nenhum post encontrado para o periodo selecionado.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Conteudo</th>
                      <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Plataforma</th>
                      <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Curtidas</th>
                      <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Comentarios</th>
                      <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Compartilhamentos</th>
                      <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Engajamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPosts.map((post) => (
                      <tr key={post.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px', fontSize: 13, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {post.content}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <PlatformIcon platform={post.platform} size={20} />
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: 13 }}>{formatNumber(post.likes)}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: 13 }}>{formatNumber(post.comments)}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: 13 }}>{formatNumber(post.shares)}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: 13, color: 'var(--accent)' }}>
                          {post.engagementRate.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
