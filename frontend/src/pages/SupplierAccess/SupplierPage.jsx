import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { CalendarRange } from 'lucide-react'
import useFetch from '@/hooks/useFetch'
import useIsMobile from '@/hooks/useIsMobile'
import { ENV } from '@/config/env'
import MobileCardList from '@/components/MobileCardList'
import StatusTabFilter from '@/components/StatusTabFilter'

const formatDate = (iso) => {
    if (!iso) return '-'
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const getStatusKey = (start, end) => {
    const now = new Date()
    if (now < new Date(start)) return 'agendado'
    if (now > new Date(end)) return 'fechado'
    return 'ativo'
}

const STATUS_TAG = {
    agendado: { variant: 'accent',   dot: 'bg-[var(--color-accent)]' },
    ativo:    { variant: 'success',  dot: 'bg-[var(--color-success)]' },
    fechado:  { variant: '',         dot: 'bg-[var(--color-text-disabled)]' },
}

/* ── Desktop card row ──────────────────────────────── */
const DesktopCard = ({ p, onClick, idx }) => {
    const status = getStatusKey(p.quotationStart, p.quotationEnd)
    const { variant, dot } = STATUS_TAG[status]
    const labelMap = { agendado: 'Agendado', ativo: 'Ativo', fechado: 'Fechado' }

    const pillCls = {
        accent:  'inline-flex items-center gap-[0.3rem] px-[0.7rem] py-[0.25rem] text-[0.8125rem] font-semibold tracking-[0.03em] rounded-full text-[var(--color-accent-strong)] bg-[var(--color-highlight-lighter)] border border-[var(--color-highlight-border)]',
        success: 'inline-flex items-center gap-[0.3rem] px-[0.7rem] py-[0.25rem] text-[0.8125rem] font-semibold tracking-[0.03em] rounded-full text-[var(--color-success-strong)] bg-[var(--color-success-lighter)] border border-[var(--color-success-border)]',
        '':      'inline-flex items-center gap-[0.3rem] px-[0.7rem] py-[0.25rem] text-[0.8125rem] font-semibold tracking-[0.03em] rounded-full text-[var(--color-text-muted)] bg-[var(--color-surface-muted)] border border-[var(--color-border-default)]',
    }[variant]

    return (
        <div
            className="group bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] [box-shadow:var(--shadow-card-soft)] px-6 py-5 cursor-pointer transition-[transform,box-shadow,border-color] duration-[180ms] hover:-translate-y-[2px] hover:[box-shadow:var(--shadow-sm)] hover:border-[var(--color-highlight-border)] animate-[cardAppear_0.28s_ease-out_both]"
            style={{ animationDelay: `${idx * 40}ms` }}
            onClick={onClick}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-highlight-soft)] to-[var(--color-highlight)] border border-[var(--color-highlight-border)] flex items-center justify-center text-[var(--color-accent)]">
                        <CalendarRange size={22} strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                        <p className="m-0 font-bold text-[var(--color-text-heading)] text-[1.0625rem] leading-[1.3] truncate">
                            Cotação #{p.quotationId}
                        </p>
                        <div className="flex items-center gap-4 mt-[0.35rem] flex-wrap">
                            <span className="text-[0.9375rem] text-[var(--color-text-muted)]">
                                <strong className="font-semibold text-[var(--color-text-neutral)]">Início:</strong>{' '}
                                {formatDate(p.quotationStart)}
                            </span>
                            <span className="text-[var(--color-border-strong)] select-none text-[0.9375rem]">·</span>
                            <span className="text-[0.9375rem] text-[var(--color-text-muted)]">
                                <strong className="font-semibold text-[var(--color-text-neutral)]">Fim:</strong>{' '}
                                {formatDate(p.quotationEnd)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className={pillCls}>
                        <span className={`inline-block w-[0.45rem] h-[0.45rem] rounded-full ${dot}`} />
                        {labelMap[status]}
                    </span>
                </div>
            </div>
            <p className="m-0 mt-3 text-[0.875rem] font-medium text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-160">
                Visualizar cotação →
            </p>
        </div>
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
        const base = { '': participations.length, ativo: 0, agendado: 0, fechado: 0 }
        for (const p of participations) {
            const s = getStatusKey(p.quotationStart, p.quotationEnd)
            base[s] = (base[s] ?? 0) + 1
        }
        return base
    }, [participations])

    const filtered = useMemo(() => {
        if (!statusFilter) return participations
        return participations.filter((p) => getStatusKey(p.quotationStart, p.quotationEnd) === statusFilter)
    }, [participations, statusFilter])

    /* ── Mobile layout ── */
    if (isMobile) {
        return (
            <MobileCardList
                loading={loading}
                items={filtered}
                idKey="quotationId"
                emptyMessage={error || 'Nenhuma cotação encontrada.'}
                onCardClick={handleSelect}
                inlineToolbar={
                    <StatusTabFilter
                        value={statusFilter}
                        onChange={setStatusFilter}
                        counts={counts}
                        mobile
                    />
                }
                renderCard={(p) => {
                    const status = getStatusKey(p.quotationStart, p.quotationEnd)
                    const labelMap = { agendado: 'Agendado', ativo: 'Ativo', fechado: 'Fechado' }
                    const { variant } = STATUS_TAG[status]
                    return {
                        avatar: <CalendarRange size={18} strokeWidth={1.75} />,
                        title: `Cotação #${p.quotationId}`,
                        subtitle: `Início: ${formatDate(p.quotationStart)}`,
                        meta: `Fim: ${formatDate(p.quotationEnd)}`,
                        tags: [{ label: labelMap[status], variant }],
                    }
                }}
            />
        )
    }

    /* ── Desktop layout ── */
    return (
        <div className="page-wrapper text-[var(--color-text-body)]">
            <div className="w-full max-w-[680px] mx-auto">
                <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                    <h2 className="text-[var(--color-text-heading)] text-[1.25rem] font-semibold m-0">
                        Suas Cotações
                    </h2>
                    <StatusTabFilter
                        value={statusFilter}
                        onChange={setStatusFilter}
                        counts={counts}
                    />
                </div>

                {error && (
                    <p className="text-[var(--color-danger)] text-[0.875rem]">{error}</p>
                )}

                {!loading && filtered.length === 0 && !error && (
                    <div className="empty-state min-h-[200px]">
                        <div className="empty-icon">
                            <CalendarRange size={28} strokeWidth={1.5} />
                        </div>
                        <p>Nenhuma cotação encontrada.</p>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col gap-3">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-[5.5rem] rounded-[var(--radius-xl)] bg-[var(--color-surface-sunken)] animate-[skeletonPulse_1.4s_ease-in-out_infinite]"
                                style={{ animationDelay: `${i * 80}ms` }}
                            />
                        ))}
                    </div>
                )}

                {!loading && filtered.length > 0 && (
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
