import React, { useState, useEffect, useCallback } from 'react'
import api from '@/hooks/useApi'
import PlatformIcon from '@/components/ui/PlatformIcon'

interface CalendarPost {
  id: string
  content: string
  platforms: string[]
  status: string
  scheduledAt?: string
  publishedAt?: string
  clientName?: string
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const STATUS_COLORS: Record<string, string> = {
  publicado: '#10b981',
  agendado: '#3b82f6',
  rascunho: '#6b7280',
  falhou: '#ef4444',
}

const statusBadgeClass = (s: string) => {
  const m: Record<string, string> = { publicado: 'success', agendado: 'info', rascunho: 'warning', falhou: 'danger' }
  return m[s] || 'info'
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 2, 1))
  const [posts, setPosts] = useState<CalendarPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [editPost, setEditPost] = useState<CalendarPost | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editStatus, setEditStatus] = useState('')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const fetchCalendar = useCallback(async () => {
    setLoading(true)
    try {
      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
      const res = await api.get(`/api/v1/calendar?month=${monthStr}`)
      setPosts(res.posts ?? res ?? [])
    } catch (e) {
      console.error('Erro ao carregar calendario:', e)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    fetchCalendar()
  }, [fetchCalendar])

  const prevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(null) }
  const nextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(null) }

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const getPostsForDay = (day: number) => {
    return posts.filter((p) => {
      const d = p.scheduledAt || p.publishedAt
      if (!d) return false
      const pd = new Date(d)
      return pd.getFullYear() === year && pd.getMonth() === month && pd.getDate() === day
    })
  }

  const dayPostsSelected = selectedDay ? getPostsForDay(selectedDay) : []

  const openEditModal = (post: CalendarPost) => {
    setEditPost(post)
    setEditContent(post.content)
    setEditStatus(post.status)
  }

  const saveEdit = async () => {
    if (!editPost) return
    try {
      await api.put(`/api/v1/posts/${editPost.id}`, { content: editContent, status: editStatus })
      setEditPost(null)
      fetchCalendar()
    } catch (e) {
      console.error('Erro ao salvar:', e)
    }
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Calendario</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="glass-button secondary" onClick={prevMonth} style={{ padding: '8px 16px' }}>
            &lt; Anterior
          </button>
          <span style={{ fontSize: 18, fontWeight: 600, minWidth: 180, textAlign: 'center' }}>
            {MONTHS[month]} {year}
          </span>
          <button className="glass-button secondary" onClick={nextMonth} style={{ padding: '8px 16px' }}>
            Proximo &gt;
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 48 }}>
          Carregando calendario...
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div className="glass-card" style={{ padding: 16, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 8 }}>
                {DAYS_OF_WEEK.map((d) => (
                  <div
                    key={d}
                    style={{
                      textAlign: 'center',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      padding: '8px 0',
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ minHeight: 80 }} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayPosts = getPostsForDay(day)
                  const isSelected = selectedDay === day
                  const today = new Date()
                  const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate()

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      style={{
                        minHeight: 80,
                        padding: 6,
                        borderRadius: 10,
                        cursor: 'pointer',
                        background: isSelected
                          ? 'rgba(16,185,129,0.12)'
                          : 'rgba(255,255,255,0.02)',
                        border: isToday
                          ? '1px solid var(--accent)'
                          : isSelected
                          ? '1px solid rgba(16,185,129,0.3)'
                          : '1px solid rgba(255,255,255,0.04)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: isToday ? 700 : 400,
                          color: isToday ? 'var(--accent)' : 'var(--text)',
                          marginBottom: 4,
                        }}
                      >
                        {day}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {dayPosts.slice(0, 4).map((p) => (
                          <div
                            key={p.id}
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: STATUS_COLORS[p.status] || '#6b7280',
                            }}
                            title={`${p.status} - ${p.content.slice(0, 30)}`}
                          />
                        ))}
                        {dayPosts.length > 4 && (
                          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>+{dayPosts.length - 4}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
              {Object.entries(STATUS_COLORS).map(([status, color]) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  <span style={{ textTransform: 'capitalize' }}>{status}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedDay && (
            <div style={{ width: 320, flexShrink: 0 }}>
              <div className="glass-card" style={{ padding: 20, position: 'sticky', top: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                  {selectedDay} de {MONTHS[month]}
                </h3>
                {dayPostsSelected.length === 0 ? (
                  <div style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', padding: 24 }}>
                    Nenhum post neste dia
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {dayPostsSelected.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => openEditModal(post)}
                        style={{
                          padding: 12,
                          borderRadius: 10,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                      >
                        <p style={{ fontSize: 13, marginBottom: 8, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {post.content}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {post.platforms?.map((p) => (
                            <PlatformIcon key={p} platform={p} size={16} />
                          ))}
                          <span className={`badge ${statusBadgeClass(post.status)}`} style={{ fontSize: 11 }}>
                            {post.status}
                          </span>
                        </div>
                        {post.clientName && (
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>{post.clientName}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {editPost && (
        <div className="modal-overlay" onClick={() => setEditPost(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Editar Post</h2>
              <button onClick={() => setEditPost(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 20, cursor: 'pointer' }}>
                ✕
              </button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Conteudo</label>
              <textarea
                className="glass-input"
                rows={4}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Status</label>
              <select className="glass-input" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                <option value="rascunho">Rascunho</option>
                <option value="agendado">Agendado</option>
                <option value="publicado">Publicado</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              {editPost.platforms?.map((p) => (
                <PlatformIcon key={p} platform={p} size={20} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="glass-button secondary" onClick={() => setEditPost(null)}>Cancelar</button>
              <button className="glass-button" onClick={saveEdit}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
