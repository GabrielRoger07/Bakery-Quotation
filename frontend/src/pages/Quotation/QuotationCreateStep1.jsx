import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'

const QuotationCreateStep1 = ({ start, end, onChange, onNext, loading }) => {
    
    const { t } = useTranslation()

    const [localStart, setLocalStart] = useState(start || "")
    const [localEnd, setLocalEnd] = useState(end || "")
    const [localError, setLocalError] = useState("")

    useEffect(() => {
        setLocalStart(start)
        setLocalEnd(end)
    }, [start, end])

    const handleNextClick = () => {
        onChange("start", localStart)
        onChange("end", localEnd)

        if(!localStart || !localEnd) {
            setLocalError(t("all_fields_required"))
            return
        }

        const now = new Date()
        const s = new Date(localStart)
        const e = new Date(localEnd)

        if(s <= now){
            setLocalError(t("quotation_start_bigger_now"))
            return
        } else if(e <= now) {
            setLocalError(t("quotation_end_lower_now"))
            return
        } else if(e <= s){
            setLocalError(t("quotation_end_lower_start"))
            return
        }

        setLocalError("")
        onNext()
    }
    
    return (
        <div className="step-dates-container">
            <h2 className="step-title">{t("quotation_step_1")}</h2>

            <p className="step-subtitle">
                {t("quotation_step_1_subtitle_1")} <br />
                {t("quotation_step_1_subtitle_2")}
            </p>

            <div className="date-inputs">
                <div className="date-input-item">
                    <label htmlFor="quotation-start">{t("quotation_start_date")}</label>
                    <Input id="quotation-start" type="datetime-local" value={localStart} onChange={e => setLocalStart(e.target.value)} className={localError && !localStart ? "input-error" : ""} />
                </div>
            </div>
            <div className="date-inputs">
                <div className="date-input-item">
                    <label htmlFor="quotation-end">{t("quotation_end_date")}</label>
                    <Input id="quotation-end" type="datetime-local" value={localEnd} onChange={e => setLocalEnd(e.target.value)} className={localError && !localEnd ? "input-error" : ""} />
                </div>
            </div>

            {localError && <Alert message={localError}/>}

            <div className="step-navigation">
                <Button onClick={handleNextClick} disabled={loading}>{loading ? t("loading_message") : t("next_button")}</Button>
            </div>

        </div>
    )
}

export default QuotationCreateStep1