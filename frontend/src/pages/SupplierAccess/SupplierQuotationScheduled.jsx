import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import useIsMobile from "@/hooks/useIsMobile"
import { formatDateTime } from "@/utils/formatDateTime"
import MetaCard from "@/components/MetaCard"
import EmptyState from "@/components/EmptyState"
import { ChevronLeft, Clock, Flag, Calendar, CalendarClock } from "lucide-react"

const pad2 = (n) => String(n).padStart(2, "0")

const formatRemaining = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))

    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    return days > 0 ? `${days}d ${pad2(hours)}h ${pad2(mins)}m ${pad2(secs)}s` : `${pad2(hours)}h ${pad2(mins)}m ${pad2(secs)}s`
}

const SupplierQuotationScheduled = ({ quotation }) => {

    const navigate = useNavigate()
    const isMobile = useIsMobile()

    const startTimeMs = useMemo(
        () => new Date(quotation.quotationStart).getTime(), [quotation.quotationStart]
    )

    const [remainingMs, setRemainingMs] = useState(() => Math.max(0, startTimeMs - Date.now()))

    useEffect(() => {

        let timeoutId

        const tick = () => {
            const diff = startTimeMs - Date.now()
            const safeDiff = Math.max(0, diff)
            setRemainingMs(safeDiff)

            if(diff > 0) {
                timeoutId = setTimeout(tick, 1000)
            }
        }

        tick()

        return () => {
            if(timeoutId) clearTimeout(timeoutId)
        }

    }, [startTimeMs])

    const remainingText = remainingMs <= 0 ? "Iniciando agora" : formatRemaining(remainingMs)

    /* ── Mobile layout ──────────────────────────────────────────── */
    if (isMobile) {
        const quotationStartFormatted = formatDateTime(quotation.quotationStart)
        const quotationEndFormatted = formatDateTime(quotation.quotationEnd)

        return (
            <div className="qm-mobile-root">
                {/* Sticky header */}
                <div className="qm-mobile-header">
                    <button className="qm-mobile-back-btn" onClick={() => navigate(-1)} aria-label="Voltar">
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="qm-mobile-header-center">
                        <span className="qm-mobile-title">Cotação #{quotation.quotationId}</span>
                        <span className="qm-mobile-status-pill qm-status--scheduled">Agendado</span>
                    </div>
                    <div style={{ width: '2.25rem' }} />
                </div>

                {/* Countdown banner */}
                <div className="qm-countdown-banner qm-status--scheduled">
                    <Clock size={22} strokeWidth={2} className="qm-countdown-icon" />
                    <div className="qm-countdown-text">
                        <span className="qm-countdown-label">Começa em</span>
                        <span className="qm-countdown-time">{remainingText}</span>
                    </div>
                </div>

                {/* Dates info */}
                <div className="grid grid-cols-2 gap-2 mx-4 mt-3">
                    <MetaCard
                        tone="success"
                        icon={<Flag size={16} strokeWidth={2} />}
                        label="Início"
                        value={quotationStartFormatted ? `${quotationStartFormatted.date}, ${quotationStartFormatted.time}` : "-"}
                    />
                    <MetaCard
                        tone="danger"
                        icon={<Calendar size={16} strokeWidth={2} />}
                        label="Fim"
                        value={quotationEndFormatted ? `${quotationEndFormatted.date}, ${quotationEndFormatted.time}` : "-"}
                    />
                </div>
            </div>
        )
    }

    /* ── Desktop layout ──────────────────────────────────────────── */
    const quotationStartFormatted = formatDateTime(quotation.quotationStart)
    const quotationEndFormatted = formatDateTime(quotation.quotationEnd)

    const startText = quotationStartFormatted ? `${quotationStartFormatted.date}, ${quotationStartFormatted.time}` : "-"
    const endText = quotationEndFormatted ? `${quotationEndFormatted.date}, ${quotationEndFormatted.time}` : "-"

    return (
        <div className="text-[var(--color-text-body)]">

            {/* ── Header (padrão QuotationMonitor, abaixo da SupplierNavbar) ── */}
            <header className="sticky top-[3.375rem] z-[100] flex items-center gap-4 px-6 h-[4.5rem] bg-[var(--color-surface-card)] border-b border-[var(--color-border-default)] flex-shrink-0">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] cursor-pointer transition-[background,border-color,color] duration-[160ms] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-body)] flex-shrink-0"
                    aria-label="Voltar"
                >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                </button>

                <div className="w-px h-8 bg-[var(--color-border-default)] flex-shrink-0" />

                <div className="min-w-0">
                    <span className="block text-label font-bold uppercase tracking-[0.08em] text-[var(--color-accent)]">
                        {quotation.isAuction ? "Leilão reverso" : "Cotação única"}
                    </span>
                    <div className="flex items-center gap-2.5">
                        <h1 className="m-0 text-[1.375rem] font-extrabold tracking-[-0.02em] text-[var(--color-text-heading)] leading-tight truncate">
                            Cotação #{quotation.quotationId}
                        </h1>
                        <span className="qm-mobile-status-pill qm-status--scheduled">Agendado</span>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-3 flex-shrink-0">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] px-3 py-1.5 text-caption font-semibold text-[var(--color-text-muted)]">
                        <Flag size={14} strokeWidth={2} className="text-[var(--color-success)]" />
                        Início · {startText}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] px-3 py-1.5 text-caption font-semibold text-[var(--color-text-muted)]">
                        <Calendar size={14} strokeWidth={2} className="text-[var(--color-danger)]" />
                        Fim · {endText}
                    </span>
                </div>
            </header>

            {/* ── Countdown banner (igual ao mobile) ── */}
            <div className="qm-countdown-banner qm-status--scheduled top-[7.875rem]">
                <Clock size={22} strokeWidth={2} className="qm-countdown-icon" />
                <div className="qm-countdown-text">
                    <span className="qm-countdown-label">Começa em</span>
                    <span className="qm-countdown-time">{remainingText}</span>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 py-10">
                <EmptyState
                    className="max-w-[34rem] mx-auto"
                    icon={<CalendarClock size={28} strokeWidth={1.75} />}
                    title="A cotação ainda não começou"
                    description={`Os produtos e o envio de propostas ficam disponíveis a partir de ${startText}.`}
                />
            </div>
        </div>
    )
}

export default SupplierQuotationScheduled
