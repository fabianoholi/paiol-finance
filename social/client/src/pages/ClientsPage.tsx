import React, { useState, useEffect, useCallback } from 'react'
import api from '@/hooks/useApi'

interface Client {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  notes?: string
  monthlyBudget?: number
  costPerPost?: number
  totalPosts?: number
  totalCost?: number
  activeAccounts?: number
  postsThisMonth?: number
  costThisMonth?: number
}

const emptyForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  notes: '',
  monthlyBudget: '',
  costPerPost: '',
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchClients = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/clients')
      setClients(res.clients ?? res ?? [])
    } catch (e) {
      console.error('Erro ao carregar clientes:', e)
    }
  }, [])

  useEffect(() => {
    fetchClients().finally(() => setLoading(false))
  }, [fetchClients])

  const openNew = () => {
    setEditingClient(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (client: Client) => {
    setEditingClient(client)
    setForm({
      name: client.name,
      company: client.company ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
      notes: client.notes ?? '',
      monthlyBudget: client.monthlyBudget?.toString() ?? '',
      costPerPost: client.costPerPost?.toString() ?? '',
    })
    setModalOpen(true)
  }

  const saveClient = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const body = {
        name: form.name,
        company: form.company || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        notes: form.notes || undefined,
        monthlyBudget: form.monthlyBudget ? parseFloat(form.monthlyBudget) : undefined,
        costPerPost: form.costPerPost ? parseFloat(form.costPerPost) : undefined,
      }
      if (editingClient?.id) {
        await api.put(`/api/v1/clients/${editingClient.id}`, body)
      } else {
        await api.post('/api/v1/clients', body)
      }
      setModalOpen(false)
      setEditingClient(null)
      fetchClients()
    } catch (e) {
      console.error('Erro ao salvar cliente:', e)
    } finally {
      setSaving(false)
    }
  }

  const deleteClient = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return
    try {
      await api.del(`/api/v1/clients/${id}`)
      fetchClients()
    } catch (e) {
      console.error('Erro ao excluir cliente:', e)
    }
  }

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const formatCurrency = (v?: number) => {
    if (v == null) return 'R$ 0,00'
    return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
        Carregando clientes...
      </div>
    )
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Clientes</h1>
        <button className="glass-button" onClick={openNew}>+ Novo Cliente</button>
      </div>

      {clients.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Nenhum cliente cadastrado. Clique em "Novo Cliente" para adicionar.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {clients.map((client) => (
            <div key={client.id} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 2 }}>{client.name}</div>
                  {client.company && (
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{client.company}</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="glass-button secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => openEdit(client)}>
                    Editar
                  </button>
                  <button className="glass-button danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => deleteClient(client.id)}>
                    Excluir
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div style={{ padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Custo por Post</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent)' }}>
                    {formatCurrency(client.costPerPost)}
                  </div>
                </div>
                <div style={{ padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Orcamento Mensal</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--purple)' }}>
                    {formatCurrency(client.monthlyBudget)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total de Posts</span>
                  <span>{client.totalPosts ?? 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Custo Total</span>
                  <span style={{ color: 'var(--warning)' }}>{formatCurrency(client.totalCost)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Contas Ativas</span>
                  <span>{client.activeAccounts ?? 0}</span>
                </div>
              </div>

              {/* Cost Summary Section */}
              {(client.postsThisMonth != null || client.costThisMonth != null) && (
                <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.1)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 6 }}>Este Mes</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Posts</span>
                    <span>{client.postsThisMonth ?? 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 2 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Custo</span>
                    <span>{formatCurrency(client.costThisMonth)}</span>
                  </div>
                  {client.postsThisMonth != null && client.postsThisMonth > 0 && client.costThisMonth != null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 2 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Custo Medio</span>
                      <span>{formatCurrency(client.costThisMonth / client.postsThisMonth)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Client Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 20, cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Nome *</label>
                <input type="text" className="glass-input" value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Nome do cliente" />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Empresa</label>
                <input type="text" className="glass-input" value={form.company} onChange={(e) => updateForm('company', e.target.value)} placeholder="Nome da empresa" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Email</label>
                  <input type="email" className="glass-input" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="email@exemplo.com" />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Telefone</label>
                  <input type="text" className="glass-input" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="(11) 99999-9999" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Observacoes</label>
                <textarea className="glass-input" rows={3} value={form.notes} onChange={(e) => updateForm('notes', e.target.value)} placeholder="Notas sobre o cliente..." style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Orcamento Mensal (R$)</label>
                  <input type="number" className="glass-input" value={form.monthlyBudget} onChange={(e) => updateForm('monthlyBudget', e.target.value)} placeholder="0.00" step="0.01" min="0" />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Custo por Post (R$)</label>
                  <input type="number" className="glass-input" value={form.costPerPost} onChange={(e) => updateForm('costPerPost', e.target.value)} placeholder="0.00" step="0.01" min="0" />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
              <button className="glass-button secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="glass-button" onClick={saveClient} disabled={saving || !form.name.trim()}>
                {editingClient ? 'Salvar' : 'Criar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
