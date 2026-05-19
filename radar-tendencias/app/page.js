'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

const CAT_LABELS = {
  lancamento: 'Lançamento',
  ferramenta: 'Ferramenta',
  estrategia: 'Estratégia',
  comportamento: 'Comportamento',
  tendencia: 'Tendência'
}

const FILTERS = ['todos', 'lancamento', 'ferramenta', 'estrategia', 'comportamento', 'tendencia']

const HEAT_CONFIG = {
  alto:   { label: 'Calor alto',    color: '#D85A30' },
  médio:  { label: 'Calor médio',   color: '#EF9F27' },
  baixo:  { label: 'Em observação', color: '#1D9E75' }
}

const CAT_COLORS = {
  lancamento:    { bg: 'rgba(29,158,117,0.12)',  text: '#1D9E75' },
  ferramenta:    { bg: 'rgba(55,138,221,0.12)',  text: '#378ADD' },
  estrategia:    { bg: 'rgba(127,119,221,0.12)', text: '#7F77DD' },
  comportamento: { bg: 'rgba(239,159,39,0.12)',  text: '#EF9F27' },
  tendencia:     { bg: 'rgba(216,90,48,0.12)',   text: '#D85A30' }
}

const LOADING_STEPS = [
  'Consultando portais de marketing...',
  'Varrendo newsletters e RSS...',
  'Buscando sinais na web...',
  'IA classificando tendências...',
  'Ordenando por calor...'
]

function TrendCard({ item }) {
  const heat = HEAT_CONFIG[item.calor] || HEAT_CONFIG.baixo
  const cat = CAT_COLORS[item.categoria] || CAT_COLORS.tendencia

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardMeta}>
          <span
            className={styles.badge}
            style={{ background: cat.bg, color: cat.text }}
          >
            {CAT_LABELS[item.categoria] || item.categoria}
          </span>
          <span className={styles.fonte}>{item.fonte}</span>
        </div>
        <div className={styles.heat}>
          <span
            className={styles.heatDot}
            style={{ background: heat.color }}
          />
          <span className={styles.heatLabel}>{heat.label}</span>
        </div>
      </div>

      <div className={styles.cardTitle}>{item.titulo}</div>
      <div className={styles.cardSummary}>{item.resumo}</div>

      <div className={styles.cardFooter}>
        <div className={styles.tags}>
          {(item.tags || []).map(t => (
            <span key={t} className={styles.tag}>{t}</span>
          ))}
        </div>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Ver fonte →
          </a>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('todos')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!loading) return
    const iv = setInterval(() => {
      setStep(s => s + 1)
    }, 900)
    return () => clearInterval(iv)
  }, [loading])

  useEffect(() => {
    setLoadingMsg(LOADING_STEPS[step % LOADING_STEPS.length])
  }, [step])

  const runRadar = async () => {
    setLoading(true)
    setError(null)
    setItems([])
    setStep(0)

    try {
      const res = await fetch('/api/radar', { method: 'POST' })
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      const list = data.itens || []
      setItems(list)

      const now = new Date()
      setStats({
        total: list.length,
        high: list.filter(i => i.calor === 'alto').length,
        sources: [...new Set(list.map(i => i.fonte))].length,
        time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        date: now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'todos'
    ? items
    : items.filter(i => i.categoria === filter)

  const highItems = filtered.filter(i => i.calor === 'alto')
  const restItems = filtered.filter(i => i.calor !== 'alto')

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.liveDot} />
            <div>
              <h1 className={styles.title}>Radar de Tendências</h1>
              <p className={styles.subtitle}>Marketing digital · lançamentos</p>
            </div>
          </div>
          <button
            className={styles.btnRun}
            onClick={runRadar}
            disabled={loading}
          >
            {loading ? '↻ Buscando...' : '↻ Buscar agora'}
          </button>
        </header>

        {/* Filters */}
        <div className={styles.filters}>
          {FILTERS.map(f => (
            <button
              key={f}
              className={`${styles.pill} ${filter === f ? styles.pillActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'todos' ? 'Todos' : CAT_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Sinais captados</div>
            <div className={styles.statValue}>{stats ? stats.total : '—'}</div>
            <div className={styles.statSub}>última busca</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Calor alto</div>
            <div className={styles.statValue}>{stats ? stats.high : '—'}</div>
            <div className={styles.statSub}>requer atenção</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Fontes consultadas</div>
            <div className={styles.statValue}>{stats ? stats.sources : '—'}</div>
            <div className={styles.statSub}>portais + newsletters</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Atualizado</div>
            <div className={styles.statValue} style={{ fontSize: 18 }}>
              {stats ? stats.time : '—'}
            </div>
            <div className={styles.statSub}>{stats ? stats.date : 'aguardando'}</div>
          </div>
        </div>

        {/* States */}
        {!loading && !error && items.length === 0 && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>◎</span>
            <span>Clique em "Buscar agora" para iniciar o radar</span>
          </div>
        )}

        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.loadingBar}>
              <div className={styles.loadingFill} />
            </div>
            <p className={styles.loadingLabel}>{loadingMsg}</p>
          </div>
        )}

        {error && (
          <div className={styles.errorState}>
            ⚠ {error}
          </div>
        )}

        {/* Cards */}
        {!loading && filtered.length > 0 && (
          <div className={styles.cards}>
            {highItems.length > 0 && (
              <>
                <div className={styles.sectionLabel}>⬆ Em alta agora</div>
                {highItems.map((item, i) => <TrendCard key={i} item={item} />)}
              </>
            )}
            {restItems.length > 0 && (
              <>
                <div className={styles.sectionLabel}>Outros sinais</div>
                {restItems.map((item, i) => <TrendCard key={i} item={item} />)}
              </>
            )}
          </div>
        )}

      </div>
    </main>
  )
}
