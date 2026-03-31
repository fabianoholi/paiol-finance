import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/hooks/useApi'
import PlatformIcon from '@/components/ui/PlatformIcon'

interface Metrics {
  totalPosts: number
  scheduledPosts: number
  totalFollowers: number
  avgEngagement: number
}

interface FollowerPoint {
  date: string
  followers: number
}

interface Post {
  id: string
  content: string
  platforms: string[]
  status: string
  scheduledAt?: string
  publishedAt?: string
  clientName?: string
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [followerData, setFollowerData] = useState<FollowerPoint[]>([])
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [scheduledPosts, setScheduledPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [overview, postsRes] = await Promise.all([
          api.get('/api/v1/analytics/overview'),
          api.get('/api/v1/posts?limit=5'),
        ])
        setMetrics(overview.metrics ?? {
          totalPosts: overview.totalPosts ?? 0,
          scheduledPosts: overview.scheduledPosts ?? 0,
          totalFollowers: overview.totalFollowers ?? 0,
          avgEngagement: overview.avgEngagement ?? 0,
        })
        setFollowerData(overview.followerGrowth ?? [])
        const posts = postsRes.posts ?? postsRes ?? []
        setRecentPosts(posts.filter((p: Post) => p.status === 'publicado').slice(0, 5))
        setScheduledPosts(posts.filter((p: Post) => p.status === 'agendado').slice(0, 5))
      } catch (e) {
        console.error('Erro ao carregar dashboard:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const metricCards = [
    { label: 'Total Posts', value: metrics?.totalPosts ?? 0, color: 'var(--accent)' },
    { label: 'Posts Agendados', value: metrics?.scheduledPosts ?? 0, color: 'var(--info)' },
    { label: 'Seguidores Total', value: metrics?.totalFollowers ?? 0, color: 'var(--purple)' },
    { label: 'Engajamento Medio', value: `${(metrics?.avgEngagement ?? 0).toFixed(1)}%`, color: 'var(--warning)' },
  ]

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      publicado: 'success',
      agendado: 'info',
      rascunho: 'warning',
      falhou: 'danger',
    }
    return map[status] || 'info'
  }

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
        Carregando dashboard...
      </div>
    )
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {metricCards.map((m) => (
          <div key={m.label} className="glass-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Followers Chart */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Crescimento de Seguidores (30 dias)</h2>
        {followerData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={followerData}>
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="followers"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 40 }}>
            Nenhum dado de seguidores disponivel
          </div>
        )}
      </div>

      {/* Recent & Scheduled Posts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {/* Recent Posts */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Posts Recentes</h2>
          {recentPosts.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24 }}>
              Nenhum post publicado ainda
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.content}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {post.platforms?.map((p) => (
                          <PlatformIcon key={p} platform={p} size={18} />
                        ))}
                        <span className={`badge ${statusBadge(post.status)}`}>{post.status}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('pt-BR') : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Posts */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Proximos Agendados</h2>
          {scheduledPosts.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24 }}>
              Nenhum post agendado
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {scheduledPosts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.content}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {post.platforms?.map((p) => (
                          <PlatformIcon key={p} platform={p} size={18} />
                        ))}
                        {post.clientName && (
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{post.clientName}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--info)', whiteSpace: 'nowrap' }}>
                      {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
