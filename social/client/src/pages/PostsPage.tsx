import React, { useState, useEffect, useCallback } from 'react'
import api from '@/hooks/useApi'
import PlatformIcon from '@/components/ui/PlatformIcon'

interface Post {
  id: string
  content: string
  platforms: string[]
  status: string
  scheduledAt?: string
  publishedAt?: string
  clientId?: string
  clientName?: string
  cost?: number
  mediaUrl?: string
}

interface Client {
  id: string
  name: string
}

const ALL_PLATFORMS = ['instagram', 'facebook', 'twitter', 'tiktok', 'linkedin', 'youtube']

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'agendado', label: 'Agendado' },
  { value: 'publicado', label: 'Publicado' },
  { value: 'falhou', label: 'Falhou' },
]

const statusBadgeClass = (s: string) => {
  const m: Record<string, string> = { publicado: 'success', agendado: 'info', rascunho: 'warning', falhou: 'danger' }
  return m[s] || 'info'
}

const CHAR_LIMITS: Record<string, number> = {
  twitter: 280,
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  tiktok: 2200,
  youtube: 5000,
}

function PostComposerModal({
  post,
  clients,
  onClose,
  onSaved,
}: {
  post?: Post | null
  clients: Client[]
  onClose: () => void
  onSaved: () => void
}) {
  const [content, setContent] = useState(post?.content ?? '')
  const [clientId, setClientId] = useState(post?.clientId ?? '')
  const [platforms, setPlatforms] = useState<string[]>(post?.platforms ?? [])
  const [scheduledAt, setScheduledAt] = useState(post?.scheduledAt ? post.scheduledAt.slice(0, 16) : '')
  const [cost, setCost] = useState(post?.cost?.toString() ?? '')
  const [mediaUrl, setMediaUrl] = useState(post?.mediaUrl ?? '')
  const [saving, setSaving] = useState(false)

  const togglePlatform = (p: string) => {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
  }

  const minCharLimit = platforms.reduce((min, p) => {
    const limit = CHAR_LIMITS[p]
    return limit && limit < min ? limit : min
  }, Infinity)

  const save = async (status: string) => {
    setSaving(true)
    try {
      const body = {
        content,
        platforms,
        clientId: clientId || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        cost: cost ? parseFloat(cost) : undefined,
        mediaUrl: mediaUrl || undefined,
        status,
      }
      if (post?.id) {
        await api.put(`/api/v1/posts/${post.id}`, body)
      } else {
        await api.post('/api/v1/posts', body)
      }
      onSaved()
    } catch (e) {
      console.error('Erro ao salvar post:', e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>{post?.id ? 'Editar Post' : 'Novo Post'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 20, cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Conteudo</label>
          <textarea
            className="glass-input"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva seu post aqui..."
            style={{ resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 12, marginTop: 4, color: minCharLimit !== Infinity && content.length > minCharLimit ? 'var(--danger)' : 'var(--text-secondary)' }}>
            {content.length}{minCharLimit !== Infinity ? ` / ${minCharLimit}` : ''} caracteres
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Cliente</label>
          <select className="glass-input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">Selecione um cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Plataformas</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ALL_PLATFORMS.map((p) => (
              <label
                key={p}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 10,
                  background: platforms.includes(p) ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${platforms.includes(p) ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                <input
                  type="checkbox"
                  checked={platforms.includes(p)}
                  onChange={() => togglePlatform(p)}
                  style={{ display: 'none' }}
                />
                <PlatformIcon platform={p} size={18} />
                <span style={{ textTransform: 'capitalize' }}>{p}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Agendar para</label>
          <input
            type="datetime-local"
            className="glass-input"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Custo (R$)</label>
          <input
            type="number"
            className="glass-input"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>URL da Midia</label>
          <input
            type="text"
            className="glass-input"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="glass-button secondary" onClick={() => save('rascunho')} disabled={saving || !content.trim()}>
            Salvar Rascunho
          </button>
          <button
            className="glass-button"
            onClick={() => save(scheduledAt ? 'agendado' : 'rascunho')}
            disabled={saving || !content.trim() || platforms.length === 0}
          >
            {scheduledAt ? 'Agendar' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [platformFilter, setPlatformFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  const fetchPosts = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (platformFilter) params.set('platform', platformFilter)
      if (clientFilter) params.set('clientId', clientFilter)
      const res = await api.get(`/api/v1/posts?${params.toString()}`)
      setPosts(res.posts ?? res ?? [])
    } catch (e) {
      console.error('Erro ao carregar posts:', e)
    }
  }, [statusFilter, platformFilter, clientFilter])

  const fetchClients = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/clients')
      setClients(res.clients ?? res ?? [])
    } catch (e) {
      console.error('Erro ao carregar clientes:', e)
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchPosts(), fetchClients()]).finally(() => setLoading(false))
  }, [fetchPosts, fetchClients])

  const deletePost = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este post?')) return
    try {
      await api.del(`/api/v1/posts/${id}`)
      fetchPosts()
    } catch (e) {
      console.error('Erro ao excluir post:', e)
    }
  }

  const openEdit = (post: Post) => {
    setEditingPost(post)
    setModalOpen(true)
  }

  const openNew = () => {
    setEditingPost(null)
    setModalOpen(true)
  }

  const onSaved = () => {
    setModalOpen(false)
    setEditingPost(null)
    fetchPosts()
  }

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
        Carregando posts...
      </div>
    )
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Posts</h1>
        <button className="glass-button" onClick={openNew}>+ Novo Post</button>
      </div>

      <div className="glass-card" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="glass-input" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select className="glass-input" style={{ width: 160 }} value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
          <option value="">Todas Plataformas</option>
          {ALL_PLATFORMS.map((p) => (
            <option key={p} value={p} style={{ textTransform: 'capitalize' }}>{p}</option>
          ))}
        </select>
        <select className="glass-input" style={{ width: 180 }} value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
          <option value="">Todos Clientes</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {posts.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Nenhum post encontrado. Clique em "Novo Post" para comecar.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {posts.map((post) => (
            <div key={post.id} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, marginBottom: 10, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.content}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {post.platforms?.map((p) => (
                        <PlatformIcon key={p} platform={p} size={20} />
                      ))}
                    </div>
                    <span className={`badge ${statusBadgeClass(post.status)}`}>{post.status}</span>
                    {post.clientName && (
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{post.clientName}</span>
                    )}
                    {post.cost != null && post.cost > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--accent)' }}>R$ {post.cost.toFixed(2)}</span>
                    )}
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {post.publishedAt
                        ? `Publicado em ${new Date(post.publishedAt).toLocaleDateString('pt-BR')}`
                        : post.scheduledAt
                        ? `Agendado para ${new Date(post.scheduledAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`
                        : ''}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button className="glass-button secondary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => openEdit(post)}>
                    Editar
                  </button>
                  <button className="glass-button danger" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => deletePost(post.id)}>
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <PostComposerModal
          post={editingPost}
          clients={clients}
          onClose={() => { setModalOpen(false); setEditingPost(null) }}
          onSaved={onSaved}
        />
      )}
    </div>
  )
}
