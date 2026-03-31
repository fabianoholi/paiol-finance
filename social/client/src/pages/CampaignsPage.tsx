import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import api from '@/hooks/useApi'
import PlatformIcon from '@/components/ui/PlatformIcon'

interface CampaignOverview {
  totalInvested: number
  totalClicks: number
  totalImpressions: number
  totalConversions: number
  avgCPC: number
  roas: number
}

interface Campaign {
  id: string
  name: string
  platform: string
  status: string
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  cpc: number
  roas: number
}

const statusBadgeClass = (s: string) => {
  const m: Record<string, string> = { ativo: 'success', ativa: 'success', pausado: 'warning', pausada: 'warning', encerrado: 'danger', encerrada: 'danger', active: 'success', paused: 'warning', ended: 'danger' }
  return m[s.toLowerCase()] || 'info'
}

const tooltipStyle = {
  background: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  color: '#fff',
}

export default function CampaignsPage() {
  const [overview, setOverview] = useState<CampaignOverview | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/api/v1/campaigns')
        const data = res.campaigns ?? res ?? []
        setCampaigns(data)

        // Compute overview from campaigns if not provided separately
        if (res.overview) {
          setOverview(res.overview)
        } else {
          const ov: CampaignOverview = {
            totalInvested: data.reduce((s: number, c: Campaign) => s + (c.spent ?? 0), 0),
            totalClicks: data.reduce((s: number, c: Campaign) => s + (c.clicks ?? 0), 0),
            totalImpressions: data.reduce((s: number, c: Campaign) => s + (c.impressions ?? 0), 0),
            totalConversions: data.reduce((s: number, c: Campaign) => s + (c.conversions ?? 0), 0),
            avgCPC: 0,
            roas: 0,
          }
          ov.avgCPC = ov.totalClicks > 0 ? ov.totalInvested / ov.totalClicks : 0
          ov.roas = ov.totalInvested > 0 ? (ov.totalConversions * 50) / ov.totalInvested : 0 // placeholder revenue calc
          setOverview(ov)
        }
      } catch (e) {
        console.error('Erro ao carregar campanhas:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const formatCurrency = (v: number) =>
    `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toLocaleString('pt-BR')
  }

  const overviewCards = overview
    ? [
        { label: 'Total Investido', value: formatCurrency(overview.totalInvested), color: 'var(--danger)' },
        { label: 'Cliques', value: formatNumber(overview.totalClicks), color: 'var(--info)' },
        { label: 'Impressoes', value: formatNumber(overview.totalImpressions), color: 'var(--accent)' },
        { label: 'Conversoes', value: formatNumber(overview.totalConversions), color: 'var(--purple)' },
        { label: 'CPC Medio', value: formatCurrency(overview.avgCPC), color: 'var(--warning)' },
        { label: 'ROAS', value: overview.roas.toFixed(2) + 'x', color: '#10b981' },
      ]
    : []

  const chartData = campaigns.map((c) => ({
    name: c.name.length > 20 ? c.name.slice(0, 20) + '...' : c.name,
    Investido: c.spent ?? 0,
    Conversoes: c.conversions ?? 0,
  }))

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
        Carregando campanhas...
      </div>
    )
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Campanhas & Anuncios</h1>

      {/* Overview Cards */}
      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
          {overviewCards.map((m) => (
            <div key={m.label} className="glass-card" style={{ padding: 18 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Nenhuma campanha encontrada.
        </div>
      ) : (
        <>
          {/* Campaign Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <PlatformIcon platform={campaign.platform} size={24} />
                      <span style={{ fontSize: 17, fontWeight: 600 }}>{campaign.name}</span>
                      <span className={`badge ${statusBadgeClass(campaign.status)}`}>{campaign.status}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Orcamento</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{formatCurrency(campaign.budget)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Investido</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--danger)' }}>{formatCurrency(campaign.spent)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Impressoes</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{formatNumber(campaign.impressions)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Cliques</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--info)' }}>{formatNumber(campaign.clicks)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Conversoes</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--purple)' }}>{formatNumber(campaign.conversions)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>CPC</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{formatCurrency(campaign.cpc)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>ROAS</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>{campaign.roas.toFixed(2)}x</div>
                      </div>
                    </div>
                  </div>
                  {/* Budget bar */}
                  <div style={{ width: 80, flexShrink: 0, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Gasto</div>
                    <div style={{ position: 'relative', height: 60, width: 40, margin: '0 auto', background: 'rgba(255,255,255,0.05)', borderRadius: 6, overflow: 'hidden' }}>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: `${Math.min(100, campaign.budget > 0 ? (campaign.spent / campaign.budget) * 100 : 0)}%`,
                          background: campaign.spent > campaign.budget ? 'var(--danger)' : 'var(--accent)',
                          borderRadius: '0 0 6px 6px',
                          transition: 'height 0.3s',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                      {campaign.budget > 0 ? Math.round((campaign.spent / campaign.budget) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Spend vs Conversions Chart */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Investimento vs Conversoes por Campanha</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                <Bar dataKey="Investido" fill="#ef4444" name="Investido (R$)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Conversoes" fill="#8b5cf6" name="Conversoes" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
