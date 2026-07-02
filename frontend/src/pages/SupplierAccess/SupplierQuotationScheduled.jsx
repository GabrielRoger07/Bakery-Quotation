import { useEffect, useMemo, useState } from "react"

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
