import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

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
    
    const { t } = useTranslation()
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

    const remainingText = remainingMs <= 0 ? t("starting_now") : formatRemaining(remainingMs)
    
    return (
        <div className="page-container supplier-quotation-container">
            <h2>{t("quotation")} {new Date(quotation.quotationStart).toLocaleDateString("pt-BR")} - #{quotation.quotationId}</h2>
            <h3>{t("quotation_scheduled")}</h3>

            <div className="quotation-info">
                <p>
                    <strong>{t("start_uppercase")}:</strong>{" "}
                    {new Date(quotation.quotationStart).toLocaleString()}
                </p>
                <p>
                    <strong>{t("end_uppercase")}:</strong>{" "}
                    {new Date(quotation.quotationEnd).toLocaleString()}
                </p>
            </div>

            <p>
                {t("time_remaining_to_start")}: <strong>{remainingText}</strong>
            </p>
        </div>
    )
}

export default SupplierQuotationScheduled