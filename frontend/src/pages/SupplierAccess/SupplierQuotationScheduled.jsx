import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import useIsMobile from "@/hooks/useIsMobile"
import { formatDateTime } from "@/utils/formatDateTime"
import MetaCard from "@/components/MetaCard"
import { ChevronLeft, Clock, Flag, Calendar } from "lucide-react"

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
    return (
        <div className="page-wrapper text-[var(--color-text-body)]">
            <h2 className="text-[var(--color-text-heading)] text-[1.25rem] m-0">
                Cotação {new Date(quotation.quotationStart).toLocaleDateString("pt-BR")} - #{quotation.quotationId}
            </h2>
            <h3 className="text-[var(--color-text-secondary)] mt-1 mb-4">Agendado</h3>

            <div className="flex justify-center items-center gap-[1.3rem] bg-[var(--color-surface-card)] border border-[var(--color-border-default)] [box-shadow:var(--shadow-xs)] px-[0.9rem] py-[0.68rem] rounded-[var(--radius-md)] mb-[0.9rem] text-[1rem] text-[var(--color-text-secondary)] w-full max-md:flex-col max-md:items-start max-md:gap-[0.4rem]">
                <p className="m-0 text-[1rem]">
                    <strong className="text-[1.125rem] text-[var(--color-text-heading)]">Início:</strong>{" "}
                    {new Date(quotation.quotationStart).toLocaleString()}
                </p>
                <p className="m-0 text-[1rem]">
                    <strong className="text-[1.125rem] text-[var(--color-text-heading)]">Fim:</strong>{" "}
                    {new Date(quotation.quotationEnd).toLocaleString()}
                </p>
            </div>

            <p className="text-[var(--color-text-secondary)] mt-2">
                Começa em: <strong className="text-[var(--color-text-heading)]">{remainingText}</strong>
            </p>
        </div>
    )
}

export default SupplierQuotationScheduled
