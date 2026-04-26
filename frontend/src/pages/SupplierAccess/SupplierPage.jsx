import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { CalendarRange, ChevronRight, Search } from 'lucide-react'
import useFetch from '../../hooks/useFetch'
import useIsMobile from '../../hooks/useIsMobile'
import { ENV } from '../../config/env'

const getStatus = (start, end) => {
    const now = new Date()
    if (now < new Date(start)) return 'Agendado'
    if (now > new Date(end)) return 'Fechado'
    return 'Ativo'
}

const STATUS_META = {
    Agendado: {
        dot: 'bg-[var(--color-accent)]',
        cls: 'inline-flex items-center gap-[0.3rem] px-[0.6rem] py-[0.15rem] text-[0.72rem] font-semibold tracking-[0.03em] rounded-full text-[var(--color-accent-strong)] bg-[var(--color-highlight-lighter)] border border-[var(--color-highlight-border)]',
        tagVariant: 'accent',
    },
    Ativo: {
        dot: 'bg-[var(--color-success)]',
        cls: 'inline-flex items-center gap-[0.3rem] px-[0.6rem] py-[0.15rem] text-[0.72rem] font-semibold tracking-[0.03em] rounded-full text-[var(--color-success-strong)] bg-[var(--color-success-lighter)] border border-[var(--color-success-border)]',
        tagVariant: 'success',
    },
    Fechado: {
        dot: 'bg-[var(--color-text-disabled)]',
        cls: 'inline-flex items-center gap-[0.3rem] px-[0.6rem] py-[0.15rem] text-[0.72rem] font-semibold tracking-[0.03em] rounded-full text-[var(--color-text-muted)] bg-[var(--color-surface-2)] border border-[var(--color-border)]',
        tagVariant: '',
    },
}

const formatDate = (iso) => {
    if (!iso) return '-'
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/* ── Skeleton ─────────────────────────────────────── */
const SkeletonCard = ({ delay = 0 }) => (
    <div
        className="flex items-center gap-[0.875rem] p-[0.875rem_1rem] bg-[var(--color-surface-0)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] [box-shadow:var(--shadow-card-soft)] animate-[skeletonPulse_1.4s_ease-in-out_infinite]"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="w-11 h-11 rounded-full bg-[var(--color-surface-3)] shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
            <div className="h-3 w-[55%] rounded bg-[var(--color-surface-3)]" />
            <div className="h-2.5 w-[38%] rounded bg-[var(--color-surface-3)]" />
        </div>
    </div>
)

/* ── Filter tabs ───────────────────────────────────── */
const FILTERS = ['', 'Ativo', 'Agendado', 'Fechado']
const FILTER_LABELS = { '': 'Todas', Ativo: 'Ativas', Agendado: 'Agendadas', Fechado: 'Fechadas' }
const FILTER_ACCENT = { '': 'stf-tab--neutral', Ativo: 'stf-tab--success', Agendado: 'stf-tab--accent', Fechado: 'stf-tab--neutral' }

const FilterTabs = ({ value, onChange, counts, mobile = false }) => (
    <div className={`stf-root${mobile ? ' stf-root--mobile' : ''}`}>
        {FILTERS.map((f) => {
            const isActive = value === f
            return (
                <button
                    key={f}
                    className={`stf-tab${isActive ? ` stf-tab--active ${FILTER_ACCENT[f]}` : ''}`}
                    onClick={() => onChange(f)}
                >
                    {f && (
                        <span
                            className={`stf-dot ${
                                f === 'Ativo' ? 'stf-dot--success' :
                                f === 'Agendado' ? 'stf-dot--accent' :
                                'stf-dot--neutral'
                            }`}
                        />
                    )}
                    <span className="stf-tab-label">{FILTER_LABELS[f]}</span>
                    <span className={`stf-badge${isActive ? ' stf-badge--active' : ''}`}>
                        {counts[f] ?? 0}
                    </span>
                </button>
            )
        })}
    </div>
)

/* ── Desktop card row ──────────────────────────────── */
const DesktopCard = ({ p, onClick, idx }) => {
    const status = getStatus(p.quotationStart, p.quotationEnd)
    const meta = STATUS_META[status]

    return (
        <div
            className="group bg-[var(--color-surface-0)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] [box-shadow:var(--shadow-card-soft)] px-5 py-4 cursor-pointer transition-[transform,box-shadow,border-color] duration-[180ms] hover:-translate-y-[2px] hover:[box-shadow:var(--shadow-sm)] hover:border-[var(--color-highlight-border)] animate-[cardAppear_0.28s_ease-out_both]"
            style={{ animationDelay: `${idx * 40}ms` }}
            onClick={onClick}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="card-avatar shrink-0">
                        <CalendarRange size={18} strokeWidth={1.75} />
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                        <p className="m-0 font-semibold text-[var(--color-text-strong)] text-[0.9375rem] leading-[1.3] truncate">
                            Cotação #{p.quotationId}
                        </p>
                        <div className="flex items-center gap-3 mt-[0.3rem] flex-wrap">
                            <span className="text-[0.8125rem] text-[var(--color-text-muted)]">
                                <strong className="font-medium text-[var(--color-text-subtle)]">Início:</strong>{' '}
                                {formatDate(p.quotationStart)}
                            </span>
                            <span className="text-[var(--color-border-strong)] select-none">·</span>
                            <span className="text-[0.8125rem] text-[var(--color-text-muted)]">
                                <strong className="font-medium text-[var(--color-text-subtle)]">Fim:</strong>{' '}
                                {formatDate(p.quotationEnd)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <span className={meta.cls}>
                        <span className={`inline-block w-[0.4rem] h-[0.4rem] rounded-full ${meta.dot}`} />
                        {status}
                    </span>
                    <ChevronRight
                        size={16}
                        strokeWidth={2}
                        className="text-[var(--color-text-disabled)] transition-[transform,color] duration-160 group-hover:translate-x-[2px] group-hover:text-[var(--color-accent)]"
                    />
                </div>
            </div>

            <p className="m-0 mt-3 text-[0.8125rem] font-medium text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-160">
                Visualizar cotação →
            </p>
        </div>
    )
}

/* ── Mobile card (uses MobileCardList pattern) ─────── */
const MobileCard = ({ p, onClick, idx }) => {
    const status = getStatus(p.quotationStart, p.quotationEnd)
    const meta = STATUS_META[status]

    return (
        <li
            className="card-item animate-[cardAppear_0.28s_ease-out_both]"
            style={{ animationDelay: `${idx * 35}ms` }}
        >
            <div className="card-front card-front-clickable" onClick={onClick}>
                <div className="card-avatar">
                    <CalendarRange size={18} strokeWidth={1.75} />
                </div>
                <div className="card-body">
                    <span className="card-title">Cotação #{p.quotationId}</span>
                    <span className="card-subtitle">
                        {formatDate(p.quotationStart)} → {formatDate(p.quotationEnd)}
                    </span>
                    <div className="card-tags mt-1">
                        <span className={`card-tag ${meta.tagVariant}`}>
                            <span className={`inline-block w-[0.35rem] h-[0.35rem] rounded-full ${meta.dot}`} />
                            {status}
                        </span>
                    </div>
                </div>
                <ChevronRight size={16} strokeWidth={2} className="card-chevron" />
            </div>
        </li>
    )
}

/* ── Main page ─────────────────────────────────────── */
const SupplierPage = () => {
    const { companyCnpj } = useParams()
    const navigate = useNavigate()
    const { request } = useFetch(ENV.API_BASE_URL)
    const isMobile = useIsMobile()

    const [participations, setParticipations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    useEffect(() => {
        const token = Cookies.get('supplierAccessToken')
        if (!token) {
            navigate(`/supplier/login/${companyCnpj}`)
            return
        }

        const fetch = async () => {
            setLoading(true)
            const res = await request('GET', '/participations/supplier')
            if (res.ok) {
                setParticipations(res.data.content)
                setError('')
            } else if (res.status !== 403) {
                setError('Erro ao carregar cotações')
            }
            setLoading(false)
        }

        fetch()
    }, [companyCnpj, navigate, request])

    const handleSelect = (p) =>
        navigate(`/supplier/quotation?quotationId=${p.quotationId}&participationId=${p.participationId}`)

    const counts = useMemo(() => {
        const base = { '': participations.length, Ativo: 0, Agendado: 0, Fechado: 0 }
        for (const p of participations) {
            const s = getStatus(p.quotationStart, p.quotationEnd)
            base[s] = (base[s] ?? 0) + 1
        }
        return base
    }, [participations])

    const filtered = useMemo(() => {
        if (!statusFilter) return participations
        return participations.filter((p) => getStatus(p.quotationStart, p.quotationEnd) === statusFilter)
    }, [participations, statusFilter])

    /* ── Loading ── */
    if (loading) {
        if (isMobile) {
            return (
                <div className="mobile-card-list-root !pb-6">
                    <div className="px-4 pt-4 pb-2">
                        <div className="h-8 w-[200px] rounded-full bg-[var(--color-surface-3)] animate-[skeletonPulse_1.4s_ease-in-out_infinite]" />
                    </div>
                    <div className="card-skeleton-list">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="card-skeleton" style={{ animationDelay: `${i * 80}ms` }}>
                                <div className="skel-avatar" />
                                <div className="skel-lines">
                                    <div className="skel-line skel-line-title" />
                                    <div className="skel-line skel-line-sub" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
        return (
            <div className="page-wrapper">
                <div className="w-full max-w-[680px] mx-auto">
                    <div className="flex items-center justify-between mb-5">
                        <div className="h-7 w-40 rounded bg-[var(--color-surface-3)] animate-[skeletonPulse_1.4s_ease-in-out_infinite]" />
                        <div className="h-9 w-64 rounded-full bg-[var(--color-surface-3)] animate-[skeletonPulse_1.4s_ease-in-out_infinite]" />
                    </div>
                    <div className="flex flex-col gap-3">
                        {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} delay={i * 80} />)}
                    </div>
                </div>
            </div>
        )
    }

    /* ── Error ── */
    if (error) {
        return (
            <div className={isMobile ? 'mobile-card-list-root' : 'page-wrapper'}>
                <div className="empty-state">
                    <div className="empty-icon">
                        <Search size={28} strokeWidth={1.5} />
                    </div>
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    /* ── Mobile layout ── */
    if (isMobile) {
        return (
            <div className="mobile-card-list-root !pb-6">
                {/* Filter tabs */}
                <div className="px-4 pt-4 pb-1">
                    <FilterTabs value={statusFilter} onChange={setStatusFilter} counts={counts} mobile />
                </div>

                {/* Count chip */}
                {filtered.length > 0 && (
                    <div className="count-chip-row">
                        <span className="count-chip">
                            {filtered.length} {filtered.length === 1 ? 'cotação' : 'cotações'}
                        </span>
                    </div>
                )}

                {/* Empty */}
                {filtered.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <CalendarRange size={28} strokeWidth={1.5} />
                        </div>
                        <p>Nenhuma cotação encontrada.</p>
                    </div>
                )}

                {/* Cards */}
                {filtered.length > 0 && (
                    <ul className="cards-list" style={{ paddingTop: '0.75rem' }}>
                        {filtered.map((p, idx) => (
                            <MobileCard
                                key={p.quotationId}
                                p={p}
                                idx={idx}
                                onClick={() => handleSelect(p)}
                            />
                        ))}
                    </ul>
                )}
            </div>
        )
    }

    /* ── Desktop layout ── */
    return (
        <div className="page-wrapper text-[var(--color-text-primary)]">
            <div className="w-full max-w-[680px] mx-auto">
                {/* Header row */}
                <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                    <h2 className="text-[var(--color-text-strong)] text-[1.25rem] font-semibold m-0">
                        Suas Cotações
                    </h2>
                    <FilterTabs value={statusFilter} onChange={setStatusFilter} counts={counts} />
                </div>

                {/* Empty */}
                {filtered.length === 0 && (
                    <div className="empty-state min-h-[200px]">
                        <div className="empty-icon">
                            <CalendarRange size={28} strokeWidth={1.5} />
                        </div>
                        <p>Nenhuma cotação encontrada.</p>
                    </div>
                )}

                {/* Cards */}
                {filtered.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {filtered.map((p, idx) => (
                            <DesktopCard
                                key={p.quotationId}
                                p={p}
                                idx={idx}
                                onClick={() => handleSelect(p)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SupplierPage
